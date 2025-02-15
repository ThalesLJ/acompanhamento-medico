export default function ErrorMessage({ message }: { message: string }) {
  if (!message) return null;
  
  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
      <p className="text-red-600">{message}</p>
    </div>
  );
} 