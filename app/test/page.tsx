export default function TestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Test Page</h1>
        <p className="text-xl text-muted-foreground mb-8">
          If you can see this, the theme is working!
        </p>
        <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg inline-block">
          Primary Color Works
        </div>
      </div>
    </div>
  );
}
