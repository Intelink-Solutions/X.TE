export function AuthScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid min-h-[75vh] max-w-7xl place-items-center px-4 py-12">
      <section className="glass w-full max-w-md rounded-3xl p-7 sm:p-9">
        <div className="mb-7 text-center">
          <img
            src="/logo-icon.png"
            alt="X'Touch"
            className="mx-auto h-14 w-14 rounded-2xl shadow-gold"
          />
          <h1 className="mt-5 text-3xl font-black">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </section>
    </div>
  );
}
