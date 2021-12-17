
export const DateStringStub = (): string => {
  const newDate = new Date();
  newDate.setDate(newDate.getDate() + 7);

  return `${newDate.getDate()}/${
    newDate.getMonth() + 1
  }/${newDate.getFullYear()}`;
};
