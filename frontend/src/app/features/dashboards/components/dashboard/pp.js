const promise = new Promise(res, req, (data) => {
  if (data % 2 === 0) res("hi");
  else req("hello");
});
promise(2);
