const tasks = [
  {
    id: 1,
    name: 'Amuser Nounours',
    description: "Amener Nounours dans un parc d'attraction.",
  },
  {
    id: 2,
    name: 'Faire la fête avec Nounours',
    description: "Faire une grosse fête avec pleins d'alcool est pleins de super meufs.",
  },
  {
    id: 3,
    name: 'Lire le journal',
    description: "Lire l'actualité économique et internationales.",
  },
];

export const getTasks = (request, response) => {
  response.json(tasks);
};
