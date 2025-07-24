document.addEventListener('DOMContentLoaded', () => {
    // Selectores de elementos del DOM
    const productList = document.getElementById('product-list');
    const cartTableBody = document.querySelector('#lista-carrito tbody');
    const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
    const cartCountSpan = document.getElementById('cart-count');
    const totalPriceSpan = document.getElementById('total-price');
    const cartDropdown = document.getElementById('carrito');
    const cartIcon = document.getElementById('img-carrito');
    const menuToggle = document.getElementById('menu-toggle');
    const navbar = document.querySelector('.navbar');

    let cart = []; // Array para almacenar los productos en el carrito

    // --- Funciones de Inicialización ---

    // Carga los event listeners al cargar la página
    function loadEventListeners() {
        productList.addEventListener('click', addProductToCart); // Evento para agregar productos
        cartTableBody.addEventListener('click', removeProductFromCart); // Evento para eliminar productos del carrito
        vaciarCarritoBtn.addEventListener('click', clearCart); // Evento para vaciar todo el carrito
        cartIcon.addEventListener('click', toggleCartDropdown); // Evento para mostrar/ocultar el carrito
        menuToggle.addEventListener('change', toggleMobileMenu); // Evento para el menú móvil

        // Cargar carrito desde localStorage al inicio
        loadCartFromLocalStorage();
    }

    // Carga el carrito guardado en localStorage
    function loadCartFromLocalStorage() {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
            renderCart(); // Renderiza el carrito cargado
        }
    }

    // Guarda el carrito en localStorage
    function saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // --- Funciones del Carrito ---

    // Agrega un producto al carrito
    function addProductToCart(e) {
        e.preventDefault(); // Previene el comportamiento por defecto del enlace

        // Verifica si el elemento clickeado es el botón "Agregar al Carrito"
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productCard = e.target.closest('.product-card'); // Obtiene la tarjeta del producto
            readProductData(productCard); // Lee los datos del producto y lo agrega al carrito
            showNotification('Producto agregado al carrito', 'success'); // Muestra una notificación
        }
    }

    // Lee los datos de la tarjeta del producto
    function readProductData(product) {
        const productId = product.querySelector('.add-to-cart-btn').getAttribute('data-id');
        const productName = product.querySelector('h3').textContent;
        const productPriceText = product.querySelector('.price').textContent;
        const productPrice = parseFloat(productPriceText.replace('$', '')); // Convierte el precio a número
        const productImage = product.querySelector('img').src;

        // Crea un objeto con la información del producto
        const productInfo = {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1 // Cantidad inicial
        };

        // Verifica si el producto ya está en el carrito
        const existingProduct = cart.find(item => item.id === productInfo.id);

        if (existingProduct) {
            // Si el producto ya existe, incrementa la cantidad
            existingProduct.quantity++;
        } else {
            // Si no existe, lo agrega al carrito
            cart.push(productInfo);
        }

        renderCart(); // Vuelve a renderizar el carrito
        saveCartToLocalStorage(); // Guarda el carrito actualizado
    }

    // Renderiza el carrito en la tabla HTML
    function renderCart() {
        clearCartHTML(); // Limpia el HTML actual del carrito

        let total = 0;

        // Itera sobre cada producto en el array 'cart'
        cart.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${product.image}" alt="${product.name}"></td>
                <td>${product.name}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    <input type="number" min="1" value="${product.quantity}" class="product-quantity" data-id="${product.id}">
                </td>
                <td>
                    <button class="delete-item" data-id="${product.id}"><i class="fas fa-times"></i></button>
                </td>
            `;
            cartTableBody.appendChild(row); // Agrega la fila a la tabla del carrito
            total += product.price * product.quantity; // Calcula el total
        });

        totalPriceSpan.textContent = total.toFixed(2); // Actualiza el precio total
        cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0); // Actualiza el contador de productos

        // Agrega event listeners para los cambios de cantidad
        document.querySelectorAll('.product-quantity').forEach(input => {
            input.addEventListener('change', updateProductQuantity);
        });
    }

    // Elimina un producto del carrito
    function removeProductFromCart(e) {
        e.preventDefault();
        if (e.target.classList.contains('delete-item') || e.target.parentElement.classList.contains('delete-item')) {
            const productId = e.target.closest('.delete-item').getAttribute('data-id');

            // Filtra el array 'cart' para eliminar el producto con el ID correspondiente
            cart = cart.filter(product => product.id !== productId);

            renderCart(); // Vuelve a renderizar el carrito
            saveCartToLocalStorage(); // Guarda el carrito actualizado
            showNotification('Producto eliminado del carrito', 'info');
        }
    }

    // Actualiza la cantidad de un producto en el carrito
    function updateProductQuantity(e) {
        const productId = e.target.getAttribute('data-id');
        const newQuantity = parseInt(e.target.value);

        const productToUpdate = cart.find(item => item.id === productId);

        if (productToUpdate) {
            productToUpdate.quantity = newQuantity;
            if (productToUpdate.quantity <= 0) {
                // Si la cantidad es 0 o menos, eliminar el producto
                cart = cart.filter(item => item.id !== productId);
            }
            renderCart();
            saveCartToLocalStorage();
        }
    }

    // Vacía todo el carrito
    function clearCart() {
        cart = []; // Reinicia el array del carrito
        renderCart(); // Vuelve a renderizar (mostrará el carrito vacío)
        saveCartToLocalStorage(); // Guarda el carrito vacío
        showNotification('Carrito vaciado', 'warning');
    }

    // Limpia el HTML de la tabla del carrito
    function clearCartHTML() {
        while (cartTableBody.firstChild) {
            cartTableBody.removeChild(cartTableBody.firstChild);
        }
    }

    // --- Funciones de UI/UX ---

    // Muestra/oculta el dropdown del carrito
    function toggleCartDropdown() {
        cartDropdown.classList.toggle('active');
    }

    // Cierra el dropdown del carrito si se hace clic fuera de él
    document.addEventListener('click', (e) => {
        if (!cartDropdown.contains(e.target) && !cartIcon.contains(e.target) && !e.target.classList.contains('add-to-cart-btn')) {
            cartDropdown.classList.remove('active');
        }
    });

    // Maneja el menú de navegación móvil
    function toggleMobileMenu() {
        if (menuToggle.checked) {
            navbar.style.height = navbar.scrollHeight + 'px'; // Expande el menú
        } else {
            navbar.style.height = '0'; // Contrae el menú
        }
    }

    // Función para mostrar notificaciones (ej. "Producto agregado")
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;
        document.body.appendChild(notification);

        // Forzar reflow para la animación
        void notification.offsetWidth;

        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
            notification.addEventListener('transitionend', () => {
                notification.remove();
            }, { once: true });
        }, 3000); // La notificación desaparece después de 3 segundos
    }

    // --- Inicialización ---
    loadEventListeners(); // Llama a la función principal para iniciar todo
});

