import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold">Something went wrong 😢</h1>
       <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}
