"use client";

import {useEffect, useState} from "react";
import {PokeAPI} from "pokeapi-types";

const fetchPokemon = async (name = "ditto"): Promise<PokeAPI.Pokemon> => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  return response.json();
};

interface PokeDetailProps {
  name: string;
  pokemon: PokeAPI.Pokemon;
}
const PokeDetail: React.FC<PokeDetailProps> = ({name, pokemon}) => {
  return (
    <div>
      <h1>PokeDetail</h1>
      <div>
        <h2>{name}</h2>
        <h3>abilities</h3>
        <ul>
          {pokemon.abilities.map((ability) => (
            <li key={ability.ability.name}>{ability.ability.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

function Poke() {
  const [pokemon, setPokemon] = useState<PokeAPI.Pokemon>();
  useEffect(() => {
    fetchPokemon("pikachu").then((data) => setPokemon(data));
  }, []);
  return (
    <div className="min-h-screen">
      <h1>Poke</h1>
      {pokemon && <PokeDetail name="pikachu" pokemon={pokemon} />}
    </div>
  );
}
export default Poke;
