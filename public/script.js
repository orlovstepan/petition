const signatureField = document.getElementById("signature-field");
const signature = document.getElementById("signature");
const ctx = signatureField.getContext("2d");
ctx.lineWidth = 3;
ctx.strokeStyle = "black";

console.log(signature.value);

let x = 0;
let y = 0;
let draw = false;

let drawing = (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
};

signatureField.addEventListener("mousedown", (e) => {
    draw = true;
    x = e.offsetX + 5;
    y = e.offsetY + 15;
});

signatureField.addEventListener("mousemove", (e) => {
    if (draw === true) {
        drawing(ctx, x, y, e.offsetX + 5, e.offsetY + 15);
        x = e.offsetX + 5;
        y = e.offsetY + 15;
    }
});

window.addEventListener("mouseup", (e) => {
    if (draw === true) {
        draw = false;
        let dataURL = signatureField.toDataURL();
        signature.value = dataURL;
    }
});
