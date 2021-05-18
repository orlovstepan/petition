const signatureField = document.getElementById("signature-field");
const ctx = signatureField.getContext("2d");
ctx.lineWidth = 5;
ctx.strokeStyle = "black";

const submit = document.getElementById("submit");

console.log(signatureField, submit);
