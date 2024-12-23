// Configuración de AWS SDK
AWS.config.update({
    region: "us-east-1",
    credentials: {
      accessKeyId: "",
      secretAccessKey: "",
    },
  });
  
  const s3 = new AWS.S3();
  const bucketName = "mi-bucket-imagenes-24011342";
  
  // Elementos DOM
  const uploadForm = document.getElementById("upload-form");
  const fileInput = document.getElementById("file-input");
  const progressBar = document.getElementById("progress-bar");
  const progress = document.getElementById("progress");
  const searchButton = document.getElementById("search-button");
  const searchInput = document.getElementById("search-input");
  const imageContainer = document.getElementById("image-container");
  
  // Event Listeners
  uploadForm.addEventListener("submit", handleUpload);
  searchButton.addEventListener("click", handleSearch);
  document.addEventListener("DOMContentLoaded", listImages);
  
  // Función para manejar la subida de archivos
  function handleUpload(e) {
    e.preventDefault();
    const file = fileInput.files[0];
  
    if (!file) {
      alert("Por favor, selecciona un archivo.");
      return;
    }
  
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert(
        "Tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG y GIF."
      );
      return;
    }
  
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("El archivo es demasiado grande. El tamaño máximo permitido es 5MB.");
      return;
    }
  
    uploadFile(file);
  }
  
  function uploadFile(file) {
    const params = {
      Bucket: bucketName,
      Key: `images/${Date.now()}-${file.name}`,
      Body: file,
      ContentType: file.type,
    };
  
    progressBar.style.display = "block";
    progress.style.width = "0%";
  
    const upload = s3.upload(params);
  
    upload.on("httpUploadProgress", function (evt) {
      const percentComplete = Math.round((evt.loaded * 100) / evt.total);
      progress.style.width = percentComplete + "%";
    });
  
    upload.send(function (err, data) {
      progressBar.style.display = "none";
  
      if (err) {
        console.error("Error", err);
        alert("Hubo un error al subir el archivo.");
      } else {
        alert("Archivo subido exitosamente.");
        fileInput.value = ""; 
        listImages();
      }
    });
  }
  
  function listImages() {
    const params = {
      Bucket: bucketName,
      Prefix: "images/", 
    };
  
    s3.listObjects(params, function (err, data) {
      if (err) {
        console.error("Error", err);
        return;
      }
  
      imageContainer.innerHTML = "";
  
      data.Contents.filter((obj) =>
        obj.Key.match(/\.(jpeg|jpg|gif|png)$/i)
      ).forEach(function (obj) {
        const img = document.createElement("img");
        // Si estás usando CloudFront:
        // img.src = `https://tu-distribucion.cloudfront.net/${obj.Key}`;
        // Si estás usando S3 directamente:
        img.src = `https://${bucketName}.s3.amazonaws.com/${obj.Key}`;
        img.alt = obj.Key.split("/").pop(); 
        imageContainer.appendChild(img);
      });
    });
  }
  
  function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const images = imageContainer.getElementsByTagName("img");
  
    Array.from(images).forEach((img) => {
      const fileName = img.alt.toLowerCase();
      if (fileName.includes(searchTerm)) {
        img.style.display = ""; // Muestra la imagen
      } else {
        img.style.display = "none"; // Oculta la imagen
      }
    });
  }
  