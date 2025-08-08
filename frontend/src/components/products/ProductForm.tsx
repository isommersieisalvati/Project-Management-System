import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  updateProduct,
  fetchProducts,
} from "../../store/slices/productSlice";
import type { AppDispatch, RootState } from "../../store";

interface FormData {
  name: string;
  description: string;
  price: string;
  image?: File;
}

const ProductForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { products } = useSelector((state: RootState) => state.products);
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Load product data for editing
  useEffect(() => {
    if (isEdit && id) {
      const product = products.find((p) => p.id === parseInt(id));
      if (product) {
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
        });
        if (product.image) {
          setImagePreview(`http://localhost:3001${product.image}`);
        }
      } else {
        // If product not found in state, fetch all products
        dispatch(fetchProducts({}));
      }
    }
  }, [isEdit, id, products, dispatch]);

  // Redirect non-admin users
  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = new FormData();
      productData.append("name", formData.name);
      productData.append("description", formData.description);
      productData.append("price", formData.price);

      if (formData.image) {
        productData.append("image", formData.image);
      }

      if (isEdit && id) {
        await dispatch(
          updateProduct({ id: parseInt(id), formData: productData })
        );
      } else {
        await dispatch(createProduct(productData));
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div>
      <div>
        <div>
          <div>
            <div>
              <h2>{isEdit ? "Edit Product" : "Add New Product"}</h2>
              <p>
                {isEdit
                  ? "Update the product information below"
                  : "Fill in the details to create a new product"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Product Name */}
            <div>
              <label htmlFor="name">Product Name *</label>
              <div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                />
                {errors.name && <p>{errors.name}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description">Description *</label>
              <div>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                />
                {errors.description && <p>{errors.description}</p>}
              </div>
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price">Price * (USD)</label>
              <div>
                <div>
                  <span>$</span>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
                {errors.price && <p>{errors.price}</p>}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label>Product Image</label>
              <div>
                <div>
                  {imagePreview ? (
                    <div>
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  ) : (
                    <div>
                      <span>Image</span>
                    </div>
                  )}
                  <div>
                    <label htmlFor="image">
                      <span>
                        {imagePreview ? "Change image" : "Upload a file"}
                      </span>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p>or drag and drop</p>
                  </div>
                  <p>PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div>
              <button type="button" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span>
                    <span></span>
                    {isEdit ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  <span>{isEdit ? "Update Product" : "Create Product"}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
