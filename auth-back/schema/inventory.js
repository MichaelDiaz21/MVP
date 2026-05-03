const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  id_precinto: {
  type: Number,
  required: true,
},

  tipoCodigo: {
    type: String,
    required: true,
    enum: ["PL", "GY", "BT"],
  },

  tipo: {
    type: String,
    required: true,
  },

  ciudad: {
    type: String,
    required: true,
  },

  ciudadId: {
    type: String,
    required: true,
  },

  estado: {
    type: String,
    enum: ["Disponible", "En Tránsito", "Recibido", "Baja"],
    default: "Disponible",
  },

  //CAMPOS PARA DESPACHO
  ciudadOrigenId: {
  type: String,
  default: null,
},
ciudadOrigen: {
  type: String,
  default: null,
},
ciudadDestinoId: {
  type: String,
  default: null,
},
ciudadDestino: {
  type: String,
  default: null,
},
vehiculo: {
  type: String,
  default: null,
},
operario: {
  type: String,
  default: null,
},
observaciones: {
  type: String,
  default: "",
},
fechaDespacho: {
  type: Date,
  default: null,
},

//CAMPOS PARA RECEPCION Y BAJA
receptor: {
  type: String,
  default: null,
},
condicion: {
  type: String,
  default: null,
},
observacionesRecepcion: {
  type: String,
  default: "",
},
fechaRecepcion: {
  type: Date,
  default: null,
},

});

module.exports = mongoose.model("Inventory", inventorySchema);


