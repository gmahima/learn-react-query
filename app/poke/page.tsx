"use client";

import {PokeAPI} from "pokeapi-types";
import {
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import React, {useEffect, useState} from "react";
const fetchPokemon = async (name = "ditto"): Promise<PokeAPI.Pokemon> => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  return response.json();
};

const fetchPokeList = async (
  page: number
): Promise<{results: PokeAPI.Pokemon[]; previous: string; next: string}> => {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=5&offset=${5 * page}`
  );
  return response.json();
};

interface PokeDetailProps {
  name: string;
}
interface PokeListProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const queryClient = new QueryClient();
const PokeDetail: React.FC<PokeDetailProps> = ({name}) => {
  const {data, error, isLoading} = useQuery({
    queryKey: ["pokemon", name],
    queryFn: () => fetchPokemon(name),
  });
  if (error) {
    return <div>{"Error: " + error.toString()}</div>;
  }
  return (
    <div className=" w-52 bg-gray-100 rounded pt-4 pb-4 p-8 m-8 mx-auto">
      <h2 className="text-xl text-center">{name.toUpperCase()}</h2>
      <hr></hr>
      <h3 className="text-lg">Abilities</h3>
      <ul className="list-disc">
        {isLoading
          ? "loading"
          : data!.abilities.map((ability) => (
              <li key={ability.ability.name}>{ability.ability.name}</li>
            ))}
      </ul>
    </div>
  );
};

const PokeList: React.FC<PokeListProps> = ({page, setPage}) => {
  const [selectedPokemon, setSelectedPokemon] = React.useState("");
  const queryClient = useQueryClient();
  useEffect(() => {
    const nextPage = page + 1;
    queryClient.prefetchQuery({
      queryKey: ["list", nextPage],
      queryFn: () => fetchPokeList(page + 1),
    });
  }, [page, queryClient]);
  const pokeListData = useQuery({
    queryKey: ["list", page],
    queryFn: () => fetchPokeList(page),
    placeholderData: keepPreviousData,
  });
  if (pokeListData.isSuccess) {
    return (
      <div>
        <h2 className="text-center">Pokemon</h2>
        <div className="flex flex-col">
          <ul>
            {pokeListData.data.results.map((pokemon) => (
              <li
                key={pokemon.name}
                className={`px-2 py-4 mt-2 bg-gray-100 hover:bg-gray-200 ${
                  pokemon.name === selectedPokemon &&
                  "bg-gray-300 hover:bg-gray-300"
                }`}
                onClick={() => setSelectedPokemon(pokemon.name)}
              >
                {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
              </li>
            ))}
            <div className="px-2 flex justify-between border border-gray-300 rounded mt-4">
              <button
                onClick={() => setPage((page) => page - 1)}
                disabled={!pokeListData.data.previous}
                className={`${!pokeListData.data.previous && "text-gray-200"}`}
              >
                &lt; Prev
              </button>
              <button
                disabled={!pokeListData.data.next}
                onClick={() => setPage((page) => page + 1)}
                className={`${!pokeListData.data.next && "text-gray-200"}`}
              >
                Next &gt;
              </button>
            </div>
            {selectedPokemon && (
              <PokeDetail name={selectedPokemon}></PokeDetail>
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
        <h1 className="text-4xl text-center">Pokemon</h1>
        <PokeList page={page} setPage={setPage} />
      </div>
      <ReactQueryDevtools></ReactQueryDevtools>
    </QueryClientProvider>
  );
}
export default Poke;
