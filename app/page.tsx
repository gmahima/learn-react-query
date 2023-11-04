"use client";
import {QueryClientProvider, useQuery} from "react-query";
import {QueryClient} from "react-query";
import {ErrorBoundary} from "react-error-boundary";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";

import React from "react";

interface Props {
  error: Error;
}

type CounterProps = {
  data: {
    user: {
      publication: {
        posts: {
          title: string;
        }[];
      };
    };
  };
};

const ErrorFallback: React.FC<Props> = ({error}) => {
  return (
    <div>
      <p>from error boundary</p>
      <p>An error occurred: {error.message}</p>
    </div>
  );
};

const queryClient = new QueryClient();

const query = `
    query GetUserArticles($page: Int!) {
        user(username: "gmahima") {
            publication {
                posts(page: $page) {
                    title
                    brief
                    slug
                    coverImage
                }
            }
        }
    }
`;

const getData = async () =>
  await fetch("https://api.hashnode.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {page: 0},
    }),
  }).then((data) => data.json());

function Counter() {
  const {data} = useQuery("userArticles", getData, {
    suspense: true,
  });
  console.log("data", data);

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <ul className="flex flex-col p-12 space-y-4">
        {data.data.user.publication.posts?.map((post) => (
          <li key={post.title}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <div className="bg-red-400 min-h-screen">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <React.Suspense fallback={<span>Loading...</span>}>
          <Counter />
        </React.Suspense>
      </ErrorBoundary>
    </div>
  </QueryClientProvider>
);

export default App;
