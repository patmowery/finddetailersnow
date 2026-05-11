import { SERVICE_LABELS, SERVICE_COLORS, type ServiceType } from '@/types';

interface ServiceBadgesProps {
  services: ServiceType[];
  max?: number;
}

export default function ServiceBadges({ services, max }: ServiceBadgesProps) {
  const visible = max ? services.slice(0, max) : services;
  const remaining = max ? services.length - max : 0;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((svc) => (
        <span
          key={svc}
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SERVICE_COLORS[svc]}`}
        >
          {SERVICE_LABELS[svc]}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
