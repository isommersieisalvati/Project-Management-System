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
    <div className="flex w-screen h-screen">
      {/* Left Panel - Welcome Section */}
      <div className="w-1/2 bg-[rgb(3,4,95)] flex flex-col justify-center items-center p-8">
        <h2 className="text-[rgb(240,240,240)] [font-family:sans-serif] text-6xl md:text-4xl font-extrabold mb-4">
          {isEdit ? "Edit Product" : "Add Product"}
        </h2>
        <p className="text-[rgb(229,229,229)] w-3/4 font-serif text-2xl md:text-lg max-w-md text-center">
          {isEdit
            ? "Update the product information using the form on the right."
            : "Fill in the details to create a new product for your inventory."}
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="w-1/2 flex flex-col justify-start items-center p-8 bg-gray-100">
        <div className="w-full max-w-lg">
          <div className="mb-6">
            <div className="bg-white border-solid border-2 border-gray-300 rounded-md p-6 mr-2">
              <h2 className="font-mono text-3xl font-bold mb-2">
                {isEdit ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="font-serif text-sm mb-4">
                {isEdit
                  ? "Update the product information below"
                  : "Fill in the details to create a new product"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div className="bg-white border-solid border-2 border-gray-300 rounded-md p-4 mr-2">
              <label
                htmlFor="name"
                className="font-serif text-sm font-bold mb-2 block"
              >
                Product Name *
              </label>
              <div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className="w-full border-solid border-2 border-gray-300 rounded-md p-2"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 font-serif">
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border-solid border-2 border-gray-300 rounded-md p-4 mr-2">
              <label
                htmlFor="description"
                className="font-serif text-sm font-bold mb-2 block"
              >
                Description *
              </label>
              <div>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  className="w-full border-solid border-2 border-gray-300 rounded-md p-2"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1 font-serif">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="bg-white border-solid border-2 border-gray-300 rounded-md p-4 mr-2">
              <label
                htmlFor="price"
                className="font-serif text-sm font-bold mb-2 block"
              >
                Price * (USD)
              </label>
              <div>
                <div className="flex">
                  <span className="border-solid border-2 border-gray-300 rounded-l-md p-2 bg-gray-100 text-gray-600">
                    $
                  </span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="flex-1 border-solid border-2 border-l-0 border-gray-300 rounded-r-md p-2"
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1 font-serif">
                    {errors.price}
                  </p>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-white border-solid border-2 border-gray-300 rounded-md p-4 mr-2">
              <label className="font-serif text-sm font-bold mb-2 block">
                Product Image
              </label>
              <div>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover border-solid border-2 border-gray-300 rounded-md mb-4"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-6xl mb-4">🖼️</span>
                    </div>
                  )}
                  <div className="text-center">
                    <label htmlFor="image" className="cursor-pointer">
                      <span className="border-solid border-2 border-gray-300 rounded-md p-2 mr-2 text-sm inline-block">
                        {imagePreview ? "Change image" : "Upload a file"}
                      </span>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="font-serif text-sm text-gray-600 mt-2">
                      or drag and drop
                    </p>
                  </div>
                  <p className="font-serif text-xs text-gray-500 text-center mt-2">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-white border-solid border-2 border-gray-300 rounded-md p-4 mr-2">
              <div className="flex flex-row gap-4 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="border-solid border-2 border-gray-300 rounded-md p-2 mr-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="border-solid border-2 border-gray-300 rounded-md p-2 mr-2 text-sm bg-[rgb(3,4,95)] text-white disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <span className="mr-2">⏳</span>
                      {isEdit ? "Updating..." : "Creating..."}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="mr-2">{isEdit ? "✏️" : "➕"}</span>
                      {isEdit ? "Update Product" : "Create Product"}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
