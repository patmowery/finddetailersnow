import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function updateClaimTier(
  listingId: string,
  tier: string,
  subscriptionId?: string,
  customerId?: string
) {
  // Update status to include tier (works with existing schema)
  const status = tier === 'free' ? 'approved' : `approved_${tier}`;

  const { error: statusError } = await supabaseAdmin
    .from('claims')
    .update({ status })
    .eq('listing_id', listingId);

  if (statusError) {
    console.error('Error updating claim status:', statusError);
  }

  // Try updating tier/stripe columns (works after migration runs)
  try {
    const updateData: Record<string, string | null> = { tier };
    if (subscriptionId !== undefined)
      updateData.stripe_subscription_id = subscriptionId || null;
    if (customerId !== undefined)
      updateData.stripe_customer_id = customerId || null;
    if (tier !== 'free') updateData.upgraded_at = new Date().toISOString();

    await supabaseAdmin
      .from('claims')
      .update(updateData)
      .eq('listing_id', listingId);
  } catch {
    // Columns may not exist yet — status field is the fallback
  }
}

async function recordSubscription(
  email: string,
  listingId: string,
  tier: string,
  subscriptionId?: string,
  customerId?: string
) {
  try {
    await supabaseAdmin.from('business_users').upsert(
      {
        email,
        listing_id: listingId,
        tier,
        stripe_customer_id: customerId || null,
        stripe_subscription_id: subscriptionId || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email,listing_id' }
    );
  } catch {
    // business_users columns may not have stripe fields yet — skip gracefully
    console.log('business_users upsert skipped (migration pending)');
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const listingId = session.metadata?.listing_id;
        const tier = session.metadata?.tier || 'pro';
        const email = session.customer_email;
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;
        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id;

        console.log(
          `✅ Checkout completed: listing=${listingId}, tier=${tier}, email=${email}`
        );

        if (listingId) {
          await updateClaimTier(listingId, tier, subscriptionId, customerId);

          if (email) {
            await recordSubscription(
              email,
              listingId,
              tier,
              subscriptionId,
              customerId
            );
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        console.log(
          `📝 Subscription updated: ${subscription.id}, status=${status}`
        );

        if (status === 'past_due' || status === 'unpaid') {
          // Find the claim by subscription ID in status field or stripe column
          const { data: claims } = await supabaseAdmin
            .from('claims')
            .select('listing_id')
            .or(
              `status.like.%${subscription.id}%,stripe_subscription_id.eq.${subscription.id}`
            );

          if (claims?.length) {
            for (const claim of claims) {
              await updateClaimTier(claim.listing_id, 'free');
            }
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`❌ Subscription cancelled: ${subscription.id}`);

        // Try to find by stripe_subscription_id column first
        const { data: claims } = await supabaseAdmin
          .from('claims')
          .select('listing_id')
          .or(`stripe_subscription_id.eq.${subscription.id}`);

        if (claims?.length) {
          for (const claim of claims) {
            await updateClaimTier(claim.listing_id, 'free');
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`⚠️ Payment failed: ${invoice.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
