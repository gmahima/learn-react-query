"use client";

import {
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import React, {useEffect, useState} from "react";
const getNextItemId = (id: string | undefined, list: {id: string}[]) => {
  const index = list.findIndex((item) => item.id === id);
  return list[index + 1]?.id;
};
const getPrevItemId = (id: string | undefined, list: {id: string}[]) => {
  const index = list.findIndex((item) => item.id === id);
  return list[index - 1]?.id;
};
const isFirstItem = (id: string, list: {id: string}[]) => {
  const index = list.findIndex((item) => item.id === id);
  return index === 0;
};
const isLastItem = (id: string, list: {id: string}[]) => {
  const index = list.findIndex((item) => item.id === id);
  return index === list.length - 1;
};

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

const deleteTodo = async (id: string): Promise<void> => {
  const response = await fetch(
    `https://65468e0afe036a2fa955d4ad.mockapi.io/api/v1/todos/${id}`,
    {
      method: "DELETE",
    }
  );
  return response.json();
};

interface TodoDetailProps {
  id: string;
  nextId: string;
  total: number;
  setSelectedTodo: React.Dispatch<React.SetStateAction<string | undefined>>;
}
interface TodoListProps {}

const queryClient = new QueryClient();
const TodoDetail: React.FC<TodoDetailProps> = ({
  id,
  total,
  nextId,
  setSelectedTodo,
}) => {
  const todoDataQuery = useQuery({
    queryKey: ["list", "todo", id],
    queryFn: () => fetchTodoById(id),
  });
  const deleteTodoMutation = useMutation({
    mutationFn: (todoId: string) => deleteTodo(todoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["list"],
      });
      setSelectedTodo(nextId);
    },
  });
  const queryClient = useQueryClient();
  useEffect(() => {
    if (nextId) {
      queryClient.prefetchQuery({
        queryKey: ["list", "todo", nextId],
        queryFn: () => fetchTodoById(nextId),
      });
    }
  }, [id, queryClient, total, nextId]);
  if (todoDataQuery.error) {
    return <div>{"Error: " + todoDataQuery.error.toString()}</div>;
  }
  const handleDelete = () => {
    console.log("delete todo: ", id);
    deleteTodoMutation.mutate(id);
  };
  return (
    <div className=" w-52 bg-gray-100 rounded pt-4 pb-4 p-8 m-8 mx-auto">
      {todoDataQuery.isSuccess ? (
        <div className="flex flex-col">
          <h2 className="text-xl text-center flex flex-col">
            {todoDataQuery.data.name.toUpperCase()}
          </h2>
          <hr></hr>
          <p className="text-lg">{todoDataQuery.data.description}</p>
          <button
            className="bg-red-800 rounded text-gray-50 py-1 cursor-pointer"
            onClick={handleDelete}
          >
            Delete This Todo
          </button>
        </div>
      ) : deleteTodoMutation.isSuccess ? (
        <em>Todo deleted</em>
      ) : (
        <em>...loading</em>
      )}
    </div>
  );
};

const TodoList: React.FC<TodoListProps> = () => {
  const [selectedTodo, setSelectedTodo] = React.useState<string>();
  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["list"],
      });
    },
  });
  const todoListData = useQuery({
    queryKey: ["list"],
    queryFn: () => fetchTodoList(),
    placeholderData: keepPreviousData,
  });

  //   useEffect(() => {
  //     if (todoListData.isSuccess) {
  //       setSelectedTodo(todoListData.data[0].id);
  //     }
  //   }, [todoListData.isSuccess]);

  if (todoListData.isSuccess) {
    return (
      <div>
        <div className="flex flex-col">
          <ul>
            {todoListData.data.map((todo) => (
              <li
                key={todo.id}
                className={`px-2 py-4 mt-2 bg-gray-100 hover:bg-gray-200 flex justify-between ${
                  todo.id === selectedTodo && "bg-gray-300 hover:bg-gray-300"
                }`}
              >
                <button
                  className="p-4 rounded bg-green-600 "
                  onClick={() => setSelectedTodo(todo.id)}
                >
                  👀
                </button>
                {todo.name.charAt(0).toUpperCase() + todo.name.slice(1)}

                <button
                  onClick={() => deleteTodoMutation.mutate(todo.id)}
                  className="p-4 rounded bg-red-600 "
                >
                  <span className="bg-red-600 rounded-full p-2">🗑️</span>
                </button>
              </li>
            ))}
            {selectedTodo && (
              <>
                <TodoDetail
                  nextId={getNextItemId(selectedTodo, todoListData.data)}
                  id={selectedTodo}
                  total={todoListData.data.length}
                  setSelectedTodo={setSelectedTodo}
                />
                <div className="px-2 flex justify-between border border-gray-300 rounded mt-4">
                  <button
                    onClick={() => {
                      setSelectedTodo((id) =>
                        getPrevItemId(id, todoListData.data)
                      );
                    }}
                    disabled={isFirstItem(selectedTodo, todoListData.data)}
                    className={`${
                      isFirstItem(selectedTodo, todoListData.data) &&
                      "text-gray-200"
                    }`}
                  >
                    &lt; Prev
                  </button>
                  <button
                    disabled={isLastItem(selectedTodo, todoListData.data)}
                    onClick={() =>
                      setSelectedTodo((id) =>
                        getNextItemId(id, todoListData.data)
                      )
                    }
                    className={`${
                      isLastItem(selectedTodo, todoListData.data) &&
                      "text-gray-200"
                    }`}
                  >
                    Next &gt;
                  </button>
                </div>
              </>
            )}
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
        <h1 className="text-4xl text-center">Todos</h1>
        <TodoList />
      </div>
      <ReactQueryDevtools></ReactQueryDevtools>
    </QueryClientProvider>
  );
}
export default Poke;
