"use client";

import {
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import React, {useEffect, useState} from "react";
const fetchTodoById = async (
  id: string
): Promise<{name: string; description: string; id: string}> => {
  const response = await fetch(
    `https://65468e0afe036a2fa955d4ad.mockapi.io/api/v1/todos/${id}`
  );
  return response.json();
};

const fetchTodoList = async (): Promise<
  {name: string; description: string; id: string}[]
> => {
  const response = await fetch(
    `https://65468e0afe036a2fa955d4ad.mockapi.io/api/v1/todos`
  );
  return response.json();
};

interface TodoDetailProps {
  id: string;
  total: number;
}
interface TodoListProps {}

const queryClient = new QueryClient();
const TodoDetail: React.FC<TodoDetailProps> = ({id, total}) => {
  const todoData = useQuery({
    queryKey: ["todo", id],
    queryFn: () => fetchTodoById(id),
  });
  const queryClient = useQueryClient();
  useEffect(() => {
    const nextId = (+id + 1).toString();
    const prevId = (+id - 1).toString();
    const isLast = total === +id;
    const isFirst = +id <= 1;
    if (!isLast) {
      queryClient.prefetchQuery({
        queryKey: ["todo", nextId],
        queryFn: () => fetchTodoById(nextId),
      });
    }
  }, [id, queryClient, total]);
  if (todoData.error) {
    return <div>{"Error: " + todoData.error.toString()}</div>;
  }

  return (
    <div className=" w-52 bg-gray-100 rounded pt-4 pb-4 p-8 m-8 mx-auto">
      {todoData.isSuccess ? (
        <div>
          <h2 className="text-xl text-center">
            {todoData.data.name.toUpperCase()}
          </h2>
          <hr></hr>
          <p className="text-lg">{todoData.data.description}</p>
        </div>
      ) : (
        <em>...loading</em>
      )}
    </div>
  );
};

const TodoList: React.FC<TodoListProps> = () => {
  const [selectedTodo, setSelectedTodo] = React.useState("1");
  const todoListData = useQuery({
    queryKey: ["list"],
    queryFn: () => fetchTodoList(),
    placeholderData: keepPreviousData,
  });

  if (todoListData.isSuccess) {
    return (
      <div>
        <div className="flex flex-col">
          <ul>
            {todoListData.data.map((todo) => (
              <li
                key={todo.id}
                className={`px-2 py-4 mt-2 bg-gray-100 hover:bg-gray-200 ${
                  todo.id === selectedTodo && "bg-gray-300 hover:bg-gray-300"
                }`}
                onClick={() => setSelectedTodo(todo.id)}
              >
                {todo.name.charAt(0).toUpperCase() + todo.name.slice(1)}
              </li>
            ))}
            {selectedTodo && (
              <TodoDetail id={selectedTodo} total={todoListData.data.length} />
            )}
            <div className="px-2 flex justify-between border border-gray-300 rounded mt-4">
              <button
                onClick={() => setSelectedTodo((id) => (+id - 1).toString())}
                disabled={+selectedTodo <= 1}
                className={`${+selectedTodo <= 1 && "text-gray-200"}`}
              >
                &lt; Prev
              </button>
              <button
                disabled={todoListData.data.length === +selectedTodo}
                onClick={() => setSelectedTodo((id) => (+id + 1).toString())}
                className={`${
                  todoListData.data.length === +selectedTodo && "text-gray-200"
                }`}
              >
                Next &gt;
              </button>
            </div>
          </ul>
        </div>
      </div>
    );
  } else {
    return <em>loading...</em>;
  }
};
function Poke() {
  const [page, setPage] = useState(0);
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 p-8 rounded">
        <h1 className="text-4xl text-center">Pokemon</h1>
        <TodoList page={page} setPage={setPage} />
      </div>
      <ReactQueryDevtools></ReactQueryDevtools>
    </QueryClientProvider>
  );
}
export default Poke;
