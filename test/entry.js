import template from "./template.htl";

(async () => {
  const html = await template({
    title: "HTL"
  });

  document.body.insertAdjacentHTML("beforeend", html);
})();
