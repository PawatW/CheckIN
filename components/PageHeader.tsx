interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/** Consistent top-of-page title bar for non-hero pages. */
export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="bg-white border-b border-gray-100 px-5 pt-14 pb-4 md:pt-6 lg:pt-8 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-extrabold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
