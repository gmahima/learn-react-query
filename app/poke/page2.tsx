"use client";
import {QueryClient, QueryClientProvider, useQuery} from "react-query";

const fetchPokemon = async (name = "ditto") => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  return response.json();
};
function PokeDetail({name}) {
  const query = useQuery("pokemon", () => fetchPokemon(name));
  console.log(query);
  return <div>PokeDetail</div>;
}

const queryClient = new QueryClient();
function Poke() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <h1>Poke</h1>
        <PokeDetail name="pikachu" />
      </div>
    </QueryClientProvider>
  );
}
export default Poke;
