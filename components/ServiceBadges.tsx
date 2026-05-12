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
      {visible.map((svc) => {
        const label = SERVICE_LABELS[svc];
        const color = SERVICE_COLORS[svc] ?? 'bg-gray-100 text-gray-600';
        if (!label) return null; // Skip unknown service types gracefully
        return (
          <span
            key={svc}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
          >
            {label}
          </span>
        );
      })}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
