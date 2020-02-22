import html from './template.htl?{"data":{"title":"Hello"}}';

document.body.insertAdjacentHTML("beforeend", html);
