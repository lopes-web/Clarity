import { cn } from "@/lib/utils";

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: React.ReactNode;
}

export function DashboardCard({ title, icon, children, className, ...props }: DashboardCardProps) {
  return (
    <div
      className={cn(
        "h-full rounded-xl bg-white/90 border border-pastel-pink/20 p-5",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 mb-4">
        {icon && <div className="text-pastel-purple">{icon}</div>}
        <h3 className="font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="h-[calc(100%-3rem)]">{children}</div>
    </div>
  );
}