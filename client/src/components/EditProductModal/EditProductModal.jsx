import { useState, useEffect } from "react";
import API from "../../utils/API";

const productType = [
  {
    value: "fruit",
    label: "fruit",
  },
  {
    value: "vegetable",
    label: "vegetable",
  },
  {
    value: "meat",
    label: "meat",
  },
  {
    value: "dairy",
    label: "dairy",
  },
];

const EditProductModal = (props) => {
  const [productObject, setProductObject] = useState({
    name: "",
    unitSize: 0,
    price: 0,
    quantity: 0,
    category: "",
    unitType: "",
    description: "",
    pathway: "",
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("./assets/icons/addproducts.svg");
  const [errorMessage, setErrorMessage] = useState({});

  const validateForm = (value) => {
    let errors = {};
    let isValid = false;

    // product name check
    if (!value.name.trim()) {
      errors.name = "Product Name required";
    }

    // quantity check
    if (!value.quantity) {
      errors.quantity = "Quantity required";
    } else if (isNaN(Number(value.quantity)) || Number(value.quantity) < 0) {
      errors.quantity = "Enter a valid quantity";
    }

    // unit size check
    if (!value.unitSize) {
      errors.unitSize = "Unit size required";
    } else if (isNaN(Number(value.unitSize)) || Number(value.unitSize) <= 0) {
      errors.unitSize = "Enter a valid unit size";
    }

    // unit type check
    if (!value.unitType) {
      errors.unitType = "Unit type required";
    }

    // description check
    if (!value.description) {
      errors.description = "Description required";
    } else if (value.description.length > 50) {
      errors.description = "Description is too long (40 character limit)";
    }

    // price check
    if (!value.price) {
      errors.price = "Price required";
    } else if (isNaN(Number(value.price)) || Number(value.price) <= 0) {
      errors.price = "Enter a valid price";
    }

    if (Object.keys(errors).length === 0) {
      isValid = true;
    }

    setErrorMessage(errors);
    return isValid;
  };

  useEffect(() => {
    if (props.id) {
      API.getOneProduct(props.id).then((res) => {
        setProductObject({
          name: res.data.name,
          unitSize: res.data.unitSize,
          price: res.data.price,
          quantity: res.data.quantity,
          category: res.data.category,
          unitType: res.data.unitType,
          description: res.data.description,
          pathway: res.data.pathway,
        });
        
        // Set the preview image to the product's existing image if available
        if (res.data.pathway) {
          setPreviewImage(res.data.pathway);
        }
      });
    }
  }, [props.id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProductObject({ ...productObject, [name]: value });
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    let isValid = validateForm(productObject);

    if (isValid) {
      // Create a FormData object to handle file upload
      const formData = new FormData();
      
      // Append all product data to the FormData
      formData.append('name', productObject.name);
      formData.append('unitSize', productObject.unitSize);
      formData.append('price', productObject.price);
      formData.append('quantity', productObject.quantity);
      formData.append('category', productObject.category);
      formData.append('unitType', productObject.unitType);
      formData.append('description', productObject.description);
      
      // Append the image file if one is selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      API.updateProduct(props.id, formData)
        .then(() => {
          props.handleModalState();
          props.loadProducts();
          setProductObject({
            name: "",
            unitSize: 0,
            price: 0,
            quantity: 0,
            category: "",
            unitType: "",
            description: "",
            pathway: "",
          });
          setSelectedImage(null);
        })
        .catch((err) => console.log(err));
    }
  };
  
  return (
    <>
      <div className="modal-background"></div>
      <div className="modal-card is-mobile">
        <header className="modal-card-head">
          <p className="modal-card-title has-text-centered add-product-headline">
            Edit Product
          </p>
        </header>
        <section className="modal-card-body">
          <form className="create-form">
            <div className="container has-text-centered">
              <div className="column is-10 is-offset-1">
                <div className="image-upload-container">
                  <img
                    title="Product Image"
                    id="product-image-edit"
                    src={previewImage}
                    alt="Product preview"
                    height="auto"
                    className="product-image-preview"
                  />
                  <br />
                  <div className="file">
                    <label className="file-label">
                      <input 
                        className="file-input" 
                        type="file" 
                        name="image" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <span className="file-cta">
                        <span className="file-label">
                          Change product image...
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                <br />

                {/* What kind of product it is */}

                <div className="field is-grouped is-grouped-centered">
                  <div className="field is-inline-block add-products-fields">
                    <label className="label">Category</label>
                    <div className="control">
                      <div className="select">
                        <select
                          id="selectCategoryEdit"
                          label="Select Type"
                          name="category"
                          onChange={handleInputChange}
                          value={productObject.category || ""}
                        >
                          {productType.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                          <option key="Out of Season" value="Out of Season">
                            Out of Season
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* the name of the product */}

                  <div className="field add-products-fields">
                    <label className="label">Product</label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        placeholder="Strawberries"
                        id="productNameEdit"
                        onChange={handleInputChange}
                        name="name"
                        value={productObject.name || ""}
                      />
                    </div>
                    {errorMessage.name && (
                      <p className="addProd-errors">{errorMessage.name}</p>
                    )}
                  </div>

                  {/* This is the total number of "units" that are available to be sold. It is calculated for you as you enter the total amount of each product and the unit size to sell by. */}

                  <div className="field add-products-fields">
                    <label className="label">Quantity</label>
                    <div className="control">
                      <input
                        required
                        className="input"
                        type="number"
                        id="quantityEdit"
                        onChange={handleInputChange}
                        name="quantity"
                        value={productObject.quantity || 0}
                      />
                    </div>
                  </div>
                </div>

                <div className="field is-grouped is-grouped-centered">
                  {/* The size of which each unit will be sold (Example: you buy strawberries by the pound in most places, but costco sells them in 3 pound boxes. So a "unit" is either 1 pound or 3 pounds respectively.) */}

                  <div className="field add-products-fields">
                    <label className="label">Unit Size</label>
                    <div className="control">
                      <input
                        className="input"
                        id="unitSizeEdit"
                        min="1"
                        onChange={handleInputChange}
                        name="unitSize"
                        value={productObject.unitSize || 0}
                        required
                        type="number"
                      />
                    </div>
                    {errorMessage.unitSize && (
                      <p className="addProd-errors">{errorMessage.unitSize}</p>
                    )}
                  </div>

                  {/* The unit type the product will be sold by */}
                  <div className="field add-products-fields">
                    <label className="label">Unit Type</label>
                    <div className="control">
                      <input
                        className="input"
                        id="unitTypeEdit"
                        required
                        name="unitType"
                        placeholder="lbs"
                        value={productObject.unitType || ""}
                        onChange={handleInputChange}
                        type="text"
                      />
                    </div>
                    {errorMessage.unitType && (
                      <p className="addProd-errors">{errorMessage.unitType}</p>
                    )}
                  </div>

                  {/* the price at which each unit is sold per unit */}
                  <div className="field add-products-fields">
                    <label className="label">Price</label>
                    <div className="control has-icons-left">
                      <span className="icon is-small is-left">LKR</span>
                      <input
                        className="input"
                        id="productPriceEdit"
                        onChange={handleInputChange}
                        name="price"
                        value={productObject.price || 0}
                        data-type="currency"
                        required
                        type="number"
                      />
                    </div>
                    {errorMessage.price && (
                      <p className="addProd-errors">{errorMessage.price}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* description of the product */}

              <div className="field add-products-fields">
                <label className="label">Description</label>
                <div className="control">
                  <textarea
                    className="textarea"
                    type="text"
                    placeholder="Organic Strawberries"
                    multiline="true"
                    rows={2}
                    id="descriptionEdit"
                    variant="outlined"
                    onChange={handleInputChange}
                    name="description"
                    maxLength={50}
                    value={productObject.description || ""}
                  ></textarea>
                </div>
                {errorMessage.description && (
                  <p className="addProd-errors">{errorMessage.description}</p>
                )}
              </div>
            </div>
          </form>
        </section>
        <footer className="modal-card-foot field is-grouped is-grouped-centered">
          <button
            className="button is-success"
            id="edit-save"
            onClick={handleFormSubmit}
          >
            Save
          </button>
          <button
            className="button"
            id="edit-cancel"
            onClick={props.handleModalState}
          >
            Cancel
          </button>
        </footer>
      </div>
    </>
  );
};

export default EditProductModal;