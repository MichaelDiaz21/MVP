const express = require("express");
const router = express.Router();

const Inventory = require("../schema/inventory");
const authenticateToken = require("../auth/authenticateToken");


// =============================
// GET: TODO EL INVENTARIO
// =============================
router.get("/", authenticateToken, async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.json(inventory);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener inventario" });
  }
});


// =============================
// GET: RESUMEN (NACIONAL O POR CIUDAD)
// =============================
router.get("/summary", authenticateToken, async (req, res) => {
  try {
    const { city } = req.query;

    const match = city
      ? { ciudadId: city, estado: "Disponible" }
      : { estado: "Disponible" };

    const result = await Inventory.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $toUpper: {
              $trim: {
                input: "$tipoCodigo",
              },
            },
          },
          total: { $sum: "$stock" },
        },
      },
    ]);

    console.log("SUMMARY RESULT:", result);

    const summary = {
      PL: 0,
      GY: 0,
      BT: 0,
    };

    result.forEach((item) => {
      if (summary[item._id] !== undefined) {
        summary[item._id] = item.total;
      }
    });

    res.json(summary);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener resumen" });
  }
});


// =============================
// GET: INVENTARIO POR CIUDAD
// =============================
router.get("/by-city", authenticateToken, async (req, res) => {
  try {
    const result = await Inventory.aggregate([
      {
        $match: {
          estado: "Disponible",
          ciudadId: { $ne: "nac" },
        },
      },
      {
        $group: {
          _id: {
            ciudadId: "$ciudadId",
            ciudad: "$ciudad",
            tipoCodigo: "$tipoCodigo",
          },
          total: { $sum: "$stock" },
        },
      },
    ]);

    const cities = {};

    result.forEach((item) => {
      const cityId = item._id.ciudadId;

      if (!cities[cityId]) {
        cities[cityId] = {
          id: cityId,
          city: item._id.ciudad,
          stock: {
            plastico: 0,
            guaya: 0,
            botella: 0,
          },
        };
      }

      if (item._id.tipoCodigo === "PL") {
        cities[cityId].stock.plastico = item.total;
      }

      if (item._id.tipoCodigo === "GY") {
        cities[cityId].stock.guaya = item.total;
      }

      if (item._id.tipoCodigo === "BT") {
        cities[cityId].stock.botella = item.total;
      }
    });

    res.json(Object.values(cities));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener inventario por ciudad" });
  }
});


// =============================
// POST: CARGUE MASIVO (STOCK NACIONAL)
// =============================
router.post("/bulk-load", authenticateToken, async (req, res) => {
  try {
    const { tipoCodigo, startCode, quantity } = req.body;

    if (!tipoCodigo || !startCode || !quantity) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const tipoMap = {
      PL: "Precinto Plástico",
      GY: "Precinto de Guaya",
      BT: "Precinto de Botella",
    };

    const startNumber = parseInt(startCode.replace(/\D/g, ""), 10);
    const qty = parseInt(quantity, 10);

    if (isNaN(startNumber) || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: "Rango inválido" });
    }

    const docs = [];

    for (let i = 0; i < qty; i++) {
      docs.push({
        id_precinto: startNumber + i,
        ciudad: "Stock Nacional",
        ciudadId: "nac",
        tipo: tipoMap[tipoCodigo],
        tipoCodigo,
        estado: "Disponible",
        stock: 1,
      });
    }

    await Inventory.insertMany(docs);

    res.json({
      message: "Precintos cargados correctamente",
      inserted: docs.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al cargar precintos" });
  }
});


// =============================
// POST: ASIGNAR PRECINTOS (NAC → CIUDAD)
// =============================
router.post("/assign", authenticateToken, async (req, res) => {
  try {
    const {
      tipoCodigo,
      startNumber,
      endNumber,
      destinationCity,
      destinationCityName,
    } = req.body;

    const start = parseInt(startNumber, 10);
    const end = parseInt(endNumber, 10);

    if (!tipoCodigo || !start || !end || !destinationCity || !destinationCityName) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    if (end < start) {
      return res.status(400).json({ error: "Rango inválido" });
    }

    const quantity = end - start + 1;

    // Validar disponibilidad en stock nacional
    const available = await Inventory.countDocuments({
      tipoCodigo,
      id_precinto: { $gte: start, $lte: end },
      ciudadId: "nac",
      estado: "Disponible",
    });

    if (available !== quantity) {
      return res.status(400).json({
        error: `No todos los precintos están disponibles en stock nacional. Disponibles: ${available}`,
      });
    }

    // Actualizar ubicación
    const result = await Inventory.updateMany(
      {
        tipoCodigo,
        id_precinto: { $gte: start, $lte: end },
        ciudadId: "nac",
        estado: "Disponible",
      },
      {
        $set: {
          ciudadId: destinationCity,
          ciudad: destinationCityName,
        },
      }
    );

    res.json({
      message: "Precintos asignados correctamente",
      assigned: result.modifiedCount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al asignar precintos" });
  }
});

// =============================
//POST: DESPACHAR PRECINTO
// =============================
router.post("/dispatch", authenticateToken, async (req, res) => {
  try {
    const {
      tipoCodigo,
      sealNumber,
      originCity,
      destinationCity,
      destinationCityName,
      vehicle,
      operator,
      notes,
    } = req.body;
    const number = parseInt(sealNumber, 10);

    if (!tipoCodigo || !number || !originCity || !destinationCity || !destinationCityName) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const seal = await Inventory.findOne({
      tipoCodigo,
      id_precinto: number,
      ciudadId: originCity,
      estado: "Disponible",
    });

    if (!seal) {
      return res.status(404).json({
        error: "Precinto no encontrado o no disponible en la ciudad de origen",
      });
    }

    seal.estado = "En Tránsito";
    seal.ciudadOrigenId = originCity;
    seal.ciudadOrigen = seal.ciudad;
    seal.ciudadDestinoId = destinationCity;
    seal.ciudadDestino = destinationCityName;
    seal.vehiculo = vehicle;
    seal.operario = operator;
    seal.observaciones = notes || "";
    seal.fechaDespacho = new Date();

    await seal.save();
    res.json({
      message: "Precinto marcado como en tránsito",
      seal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al despachar precinto" });
  }
});

// GET: PRECINTOS EN TRÁNSITO HACIA UNA CIUDAD
router.get("/transit/:cityId", authenticateToken, async (req, res) => {
  try {
    const { cityId } = req.params;

    const seals = await Inventory.find({
      estado: "En Tránsito",
      ciudadDestinoId: cityId,
    }).sort({ fechaDespacho: -1 });

    res.json(seals);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener precintos en tránsito" });
  }
});

router.get("/transactions/:cityId", authenticateToken, async (req, res) => {
  try {
    const { cityId } = req.params;

    const transactions = await Inventory.find({
      ciudadOrigenId: cityId,
      estado: { $in: ["En Tránsito", "Recibido"] },
    }).sort({ fechaDespacho: -1 });

    res.json(transactions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener transacciones" });
  }
});


router.put("/receive/:id", authenticateToken, async (req, res) => {
  try {
    const { receiver, condition, notes } = req.body;

    const seal = await Inventory.findById(req.params.id);

    if (!seal) {
      return res.status(404).json({ error: "Precinto no encontrado" });
    }

    if (seal.estado !== "En Tránsito") {
      return res.status(400).json({ error: "El precinto no está en tránsito" });
    }

    seal.estado = "Baja";
    seal.receptor = receiver;
    seal.condicion = condition;
    seal.observacionesRecepcion = notes || "";
    seal.fechaRecepcion = new Date();

    await seal.save();

    res.json({
      message: "Precinto recibido y dado de baja",
      seal,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al recibir precinto" });
  }
});

router.get("/decommissioned", authenticateToken, async (req, res) => {
  try {
    const seals = await Inventory.find({ estado: "Baja" }).sort({
      fechaRecepcion: -1,
    });

    res.json(seals);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener precintos dados de baja" });
  }
});

router.get("/audit", authenticateToken, async (req, res) => {
  try {
    const available = await Inventory.aggregate([
      { $match: { estado: "Disponible" } },
      {
        $group: {
          _id: "$tipoCodigo",
          total: { $sum: "$stock" },
        },
      },
    ]);

    const decommissioned = await Inventory.aggregate([
      { $match: { estado: "Baja" } },
      {
        $group: {
          _id: "$tipoCodigo",
          total: { $sum: "$stock" },
        },
      },
    ]);

    const condition = await Inventory.aggregate([
      { $match: { estado: "Baja" } },
      {
        $group: {
          _id: "$condicion",
          total: { $sum: 1 },
        },
      },
    ]);

    const totalAvailable = available.reduce((sum, item) => sum + item.total, 0);
    const totalDecommissioned = decommissioned.reduce((sum, item) => sum + item.total, 0);

    const byType = {
      PL: { available: 0, decommissioned: 0 },
      GY: { available: 0, decommissioned: 0 },
      BT: { available: 0, decommissioned: 0 },
    };

    available.forEach((item) => {
      if (byType[item._id]) byType[item._id].available = item.total;
    });

    decommissioned.forEach((item) => {
      if (byType[item._id]) byType[item._id].decommissioned = item.total;
    });

    const byCondition = {
      bueno: 0,
      danado: 0,
      violado: 0,
    };

    condition.forEach((item) => {
      if (byCondition[item._id] !== undefined) {
        byCondition[item._id] = item.total;
      }
    });

    res.json({
      totalAvailable,
      totalDecommissioned,
      totalUsed: totalDecommissioned,
      byType,
      byCondition,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener auditoría" });
  }
});

module.exports = router;



