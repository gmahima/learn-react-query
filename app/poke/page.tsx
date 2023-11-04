"use client";

import {PokeAPI} from "pokeapi-types";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import React from "react";
const fetchPokemon = async (name = "ditto"): Promise<PokeAPI.Pokemon> => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  return response.json();
};

const fetchPokeList = async (
  page: number
): Promise<{results: PokeAPI.Pokemon[]}> => {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=10&offset=0`
  );
  return response.json();
};

interface PokeDetailProps {
  name: string;
}
interface PokeListProps {}

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
    <div className=" w-52 bg-gray-50 rounded pt-4 pb-4 p-8">
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

const PokeList: React.FC<PokeListProps> = () => {
  const [selectedPokemon, setSelectedPokemon] = React.useState("");
  const {data: pokeListData} = useQuery({
    queryKey: ["list"],
    queryFn: () => fetchPokeList(1),
  });
  if (!pokeListData) {
    return "Loading...";
  }
  return (
    <div>
      <h2 className="text-center">Pokemon</h2>
      <div className="flex flex-col bg-gray-50 rounded p-8">
        <ul>
          {pokeListData.results.map((pokemon) => (
            <li
              key={pokemon.name}
              className={`mt-2 bg-gray-100 ${
                pokemon.name === selectedPokemon && "bg-gray-200"
              }`}
              onClick={() => setSelectedPokemon(pokemon.name)}
            >
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </li>
          ))}
          {selectedPokemon && <PokeDetail name={selectedPokemon}></PokeDetail>}
        </ul>
      </div>
    </div>
  );
};
function Poke() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-4xl text-center">Pokemon</h1>
        <PokeList />
      </div>
      <ReactQueryDevtools></ReactQueryDevtools>
    </QueryClientProvider>
  );
}
export default Poke;
