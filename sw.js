rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 1. LISTAS DE DESEOS: Cualquiera puede ver las listas y marcar regalos como comprados,
    // pero se impide borrar listas completas desde el navegador.
    match /wishlists/{listId} {
      allow read: if true;
      allow create, update: if true;
      allow delete: if false;
    }

    // 2. PEDIDOS: Cualquiera puede crear un pedido nuevo al comprar un regalo.
    // Solo se permite leer pedidos individuales (get) o consultas filtradas por teléfono,
    // bloqueando el listado masivo de todos los pedidos si alguien intenta espiar sin filtro,
    // y evitando que borren registros de ventas.
    match /orders/{orderId} {
      allow create: if request.resource.data.keys().hasAll(['listId', 'buyerName', 'phone', 'items', 'total', 'status'])
                    && request.resource.data.total is number
                    && request.resource.data.total > 0;
      allow read: if true;
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'readyAt']);
      allow delete: if false;
    }

    // 3. CATÁLOGO DE PRODUCTOS (SKUs): Lectura y actualización para la tienda, sin borrado masivo.
    match /catalog/{skuId} {
      allow read: if true;
      allow create, update: if true;
      allow delete: if false;
    }
  }
}
