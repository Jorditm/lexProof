export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-96 mx-auto"></div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-slate-200 rounded w-48"></div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-slate-200 rounded"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-24"></div>
                      <div className="h-4 bg-slate-200 rounded w-48"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-10 bg-slate-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
