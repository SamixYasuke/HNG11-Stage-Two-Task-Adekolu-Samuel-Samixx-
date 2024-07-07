const idGenerator = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  Array.from({ length: 16 }).forEach(() => {
    const randomIndex = Math.floor(Math.random() * characters.length);
    id += characters[randomIndex];
  });
  return id;
};

export default idGenerator;
