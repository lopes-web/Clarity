import { cn } from "@/lib/utils";

interface LogoProps extends React.HTMLAttributes<HTMLImageElement> {
  size?: number;
}

export function Logo({ size = 24, className, ...props }: LogoProps) {
  return (
    <img
      src="/logo.svg"
      alt="Clarity Logo"
      width={size}
      height={size}
      className={cn("", className)}
      {...props}
    />
  );
} 