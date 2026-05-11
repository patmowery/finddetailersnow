#!/bin/bash
# Ping search engines about sitemap updates
# Can be run after deployments or via cron

SITEMAP_URL="https://finddetailersnow.com/sitemap.xml"

echo "Pinging search engines with sitemap: $SITEMAP_URL"
echo ""

# Google
echo -n "Google: "
curl -s -o /dev/null -w "%{http_code}" "https://www.google.com/ping?sitemap=${SITEMAP_URL}"
echo ""

# Bing (also covers Yahoo)
echo -n "Bing: "
curl -s -o /dev/null -w "%{http_code}" "https://www.bing.com/ping?sitemap=${SITEMAP_URL}"
echo ""

echo ""
echo "Done! Sitemaps submitted."
