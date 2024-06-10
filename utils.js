import sharp from "sharp";

export async function cropBase64ToSquare(base64Input) {
  try {
    const inputBuffer = Buffer.from(base64Input, "base64");

    const metadata = await sharp(inputBuffer).metadata();
    const { width, height, orientation } = metadata;

    let transform = sharp(inputBuffer);

    switch (orientation) {
      case 3:
        transform = transform.rotate(180);
        break;
      case 6:
        transform = transform.rotate(90);
        break;
      case 8:
        transform = transform.rotate(-90);
        break;
    }

    const outputBuffer = await transform
      .resize(Math.min(width, height), Math.min(width, height), {
        fit: "cover",
      })
      .toBuffer();

    const base64Data = outputBuffer
      .toString("base64")
      .replace(/^data:image\/\w+;base64,/, "");
    return base64Data;
  } catch (err) {
    console.error("Error cropping image:", err);
    return null;
  }
}

export function formatDateTime(date) {
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";

  hours = hours % 12 || 12;
  const formattedHours = hours.toString().padStart(2, "0");

  return `${formattedDate}, ${formattedHours}:${minutes}:${seconds} ${ampm}`;
}
