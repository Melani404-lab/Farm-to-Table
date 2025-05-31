import axios from "axios";

const API = {
  // Get All Products
  getAllProducts: () => {
    return axios.get("/api/products");
  },

  // product routes
  addProduct: (product) => {
    // Check if product is FormData (for image uploads) or regular object
    if (product instanceof FormData) {
      return axios.post("/api/products", product, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return axios.post("/api/products", product);
  },
  
  getOneProduct: (id) => {
    return axios.get(`/api/products/${id}`);
  },
  
  updateProduct: (id, product) => {
    // Check if product is FormData (for image uploads) or regular object
    if (product instanceof FormData) {
      return axios.put(`/api/products/${id}`, product, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return axios.put("/api/products/" + id, product);
  },
  
  deleteProduct: (id) => {
    return axios.delete("/api/products/" + id);
  },

  // User routes
  addUser: (user) => {
    return axios.post("/api/users", user);
  },

  addLineItems: (lineItems) => {
    return axios.post("/api/lineItems", lineItems);
  },

  placeOrder: (order) => {
    return axios.post("/api/orders", order);
  },

  loginUser: (user) => {
    return axios.post("/api/users/login", {
      email: user.email,
      password: user.password,
    });
  },

  getFilteredProducts: (category) => {
    return axios.get(`/api/products/filtered/${category}`);
  },

  sendConfirmationEmail: (info) => {
    return axios.post("/api/sendconfirmation", info);
  },

  getEmail: (id) => {
    return axios.get("/api/users/email", {
      params: {
        id: id,
      },
    });
  },

  // call to get the orders based on id
  getOrders: (id) => {
    return axios.get("/api/orders/" + id, {
      params: {
        customer: id,
      },
    });
  },

  // Message routes
  sendMessage: (messageData) => {
    return axios.post("/api/messages", messageData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  getConversations: () => {
    return axios.get("/api/messages", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  getConversation: (userId) => {
    return axios.get(`/api/messages/conversation/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  markAsRead: (userId) => {
    return axios.put(`/api/messages/read/${userId}`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },

  getUsers: () => {
    return axios.get("/api/messages/users", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  },
};

export default API;