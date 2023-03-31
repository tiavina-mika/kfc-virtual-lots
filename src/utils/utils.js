
export const productType = [
  {
      value: "ALL",
      type: "ALL",
      label: "Tous",
      adj: ""
  },
  {
      value: "STARTER",
      type: "STARTER",
      label: "Entrée",
      adj: "Cette"
  },
  {
      value: "MAIN_COURSE",
      type: "MAIN_COURSE",
      label: "Plat",
      adj: "Ce"
  },
  {
      value: "MEAL_PREP",
      type: "MEAL_PREP",
      label: "Meal Prep",
      adj: "Ce"
  },
  {
      value: "YAOURT",
      type: "YAOURT",
      label: "Yaourt",
      adj: "Ce"
  },
  {
      value: "DESSERT",
      type: "DESSERT",
      label: "Dessert",
      adj: "Ce"
  },
  {
      value: "BREAD",
      type: "BREAD",
      label: "Pain",
      adj: "Ce"
  },
  {
      value: "CHEESE",
      type: "CHEESE",
      label: "Fromage",
      adj: "Ce"
  },
  {
      value: "BREAKFAST",
      type: "BREAKFAST",
      label: "Petit déjeuner",
      adj: "Ce"
  },
  {
      value: "DRINK",
      type: "DRINK",
      label: "Boisson",
      adj: "Cette"
  },
  {
      value: "SNACK",
      type: "SNACK",
      label: "Snack",
      adj: "Ce"
  },
  {
      value: "CUTLERY",
      type: "CUTLERY",
      label: "Couverts",
      adj: "Ce"
  },
  {
      value: "GOODIES",
      type: "GOODIES",
      label: "Goodies",
      adj: "Ce"
  }
]

export const UNKNOWN_LOT_GROUP_ID = "unknownGroup"

export const productTypeToAdd = [
  { key: "PACKAGING", value: "PACKAGING", label: "Packaging" },
  { key: "SUB_PACKAGING", value: "SUB_PACKAGING", label: "Sous-Packaging" },
  { key: "LABEL", value: "LABEL", label: "Etiquettes" },
  { key: "HYGIENE", value: "HYGIENE", label: "Hygiène" },
  { key: "WAREHOUSE_CONSUMABLE", value: "WAREHOUSE_CONSUMABLE", label: "Consommable entrepôt" },
  { key: "KITCHEN_EQUIPMENT", value: "KITCHEN_EQUIPMENT", label: "Matériel de cuisine" },
  { key: "SECURITY", value: "SECURITY", label: "Sécurité" },
]

export const supplierItemTypes = {
  SALABLE_PRODUCT: { key: "SALABLE_PRODUCT", value: "SALABLE_PRODUCT", label: "Produit vendable" },
  RAW_MATERIAL: { key: "RAW_MATERIAL", value: "RAW_MATERIAL", label: "Matière première" },
  PACKAGING_CONSUMABLE: { key: "PACKAGING_CONSUMABLE", value: "PACKAGING_CONSUMABLE", label: "Packaging - Consommable" },
}

const groupLotsByCharacter = (lots) => {
	const lotsForGroup = new Map()
	const characters = lots.map(lot => lot.orderSupplierItem.name.trim().charAt(0).toUpperCase())

	for (const char of characters) {
		const lotsForCharacter = lots.filter(lot => lot.orderSupplierItem.name.trim().charAt(0) === char.toUpperCase())
		lotsForGroup.set(char, lotsForCharacter)
	}
	return lotsForGroup
}

const isLotWithGroupIngredient = (lot, group) => {
	return (
		lot.orderSupplierItem
		&& lot.orderSupplierItem.commercialName
		&& lot.orderSupplierItem.commercialName.group
		&& lot.orderSupplierItem.commercialName.group.objectId === group.objectId
	)
}

const isLotWithoutGroupIngredient = (lot) => lot.orderSupplierItem && !lot.orderSupplierItem.commercialName

const isProductTypeWithGroupIngredient = (lot, type) => lot.orderSupplierItem && lot.orderSupplierItem.productType === type.value

export const sortLots = (lotsData, groupIngredients, newLot) => {
	const sortedLots = new Map()

	// --------------------------------------------------------------- //
	// ----------------- RAW MATERIAL SUPPLIER ITEMS ----------------- //
	// --------------------------------------------------------------- //
	const rawMaterialLots = lotsData.filter((lot) => lot.orderSupplierItem.type && lot.orderSupplierItem.type === supplierItemTypes.RAW_MATERIAL.key)
	// lots with group
	for (const group of groupIngredients) {
		const lotsWithGroup = rawMaterialLots.filter(lot => isLotWithGroupIngredient(lot, group) && +lot.quantity !== 0)
		if (newLot && newLot.orderSupplierItem.type === supplierItemTypes.RAW_MATERIAL.key && isLotWithGroupIngredient(newLot, group) && newLot.quantity === 0) {
			lotsWithGroup.push(newLot)
		}
		if (lotsWithGroup.length > 0) {
			const lotsForGroup = groupLotsByCharacter(lotsWithGroup)
			sortedLots.set(group.objectId, lotsForGroup)
		}
	}

	// lot without group
	const lotsWithoutGroup = rawMaterialLots.filter(lot => isLotWithoutGroupIngredient(lot) && +lot.quantity !== 0)
	// lot to display manually even if quantity is 0
	if (newLot && newLot.orderSupplierItem.type === supplierItemTypes.RAW_MATERIAL.key && isLotWithoutGroupIngredient(newLot) && newLot.quantity === 0) {
		lotsWithoutGroup.push(newLot)
	}
	if (lotsWithoutGroup.length > 0) {
		const lotsForGroup = groupLotsByCharacter(lotsWithoutGroup)
		sortedLots.set(UNKNOWN_LOT_GROUP_ID, lotsForGroup)
	}

	// --------------------------------------------------------------- //
	// --------------- SALABLE PRODUCT SUPPLIER ITEMS ---------------- //
	// --------------------------------------------------------------- //
	const salableProductLots = lotsData.filter((lot) => lot.orderSupplierItem.type && lot.orderSupplierItem.type === supplierItemTypes.SALABLE_PRODUCT.key && lot.orderSupplierItem.productType)

	for (const type of productType) {
		const lotsWithGroup = salableProductLots.filter(lot => isProductTypeWithGroupIngredient(lot, type) && +lot.quantity !== 0)
		// lot to display manually even if quantity is 0
		if (newLot && newLot.orderSupplierItem.type === supplierItemTypes.PACKAGING_CONSUMABLE.key && isProductTypeWithGroupIngredient(newLot, type) && newLot.quantity === 0) {
			lotsWithGroup.push(newLot)
		}
		if (lotsWithGroup.length > 0) {
			const lotsForGroup = groupLotsByCharacter(lotsWithGroup)
			sortedLots.set(supplierItemTypes.SALABLE_PRODUCT.key + "-" + type.value, lotsForGroup)
		}
	}

	// ---------------------------------------------------------------------- //
	// ------------ PACKAGING CONSUMABLE PRODUCT SUPPLIER ITEMS ------------- //
	// ---------------------------------------------------------------------- //
	const packagingConsumableProductLots = lotsData.filter((lot) => lot.orderSupplierItem.type && lot.orderSupplierItem.type === supplierItemTypes.PACKAGING_CONSUMABLE.key && lot.orderSupplierItem.productType)

	for (const key of productTypeToAdd) {
		const lotsWithGroup = packagingConsumableProductLots.filter(lot => isProductTypeWithGroupIngredient(lot, key) && +lot.quantity !== 0)
		// lot to display manually even if quantity is 0
		if (newLot && isProductTypeWithGroupIngredient(newLot, key) && newLot.quantity === 0) {
			lotsWithGroup.push(newLot)
		}
		if (lotsWithGroup.length > 0) {
			const lotsForGroup = groupLotsByCharacter(lotsWithGroup)

			sortedLots.set(supplierItemTypes.PACKAGING_CONSUMABLE.key + "-" + key.value, lotsForGroup)
		}
	}

	return sortedLots
}