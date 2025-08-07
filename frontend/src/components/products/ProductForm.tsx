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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-xl rounded-xl border border-gray-100">
        <div className="px-6 py-8 sm:p-8">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-extrabold leading-7 text-gray-900 sm:text-4xl sm:truncate">
                {isEdit ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="mt-2 text-sm font-medium text-gray-600">
                {isEdit
                  ? "Update the product information below"
                  : "Fill in the details to create a new product"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
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
                  className={`appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm ${
                    errors.name ? "border-red-300 ring-red-300" : ""
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 mb-2"
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
                  className={`appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm resize-none ${
                    errors.description ? "border-red-300 ring-red-300" : ""
                  }`}
                  placeholder="Enter product description"
                />
                {errors.description && (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Price * (USD)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm font-medium">
                    $
                  </span>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`appearance-none relative block w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm ${
                    errors.price ? "border-red-300 ring-red-300" : ""
                  }`}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    {errors.price}
                  </p>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Image
              </label>
              <div className="border-2 border-gray-300 border-dashed rounded-lg p-6 transition duration-150 ease-in-out hover:border-gray-400">
                <div className="space-y-4 text-center">
                  {imagePreview ? (
                    <div className="mb-4">
                      <img
                        className="mx-auto h-32 w-32 object-cover rounded-lg shadow-md"
                        src={imagePreview}
                        alt="Preview"
                      />
                    </div>
                  ) : (
                    <div className="mx-auto h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 font-medium">Image</span>
                    </div>
                  )}
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="image"
                      className="relative cursor-pointer bg-white rounded-md font-semibold text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 transition duration-150 ease-in-out"
                    >
                      <span className="px-2 py-1">
                        {imagePreview ? "Change image" : "Upload a file"}
                      </span>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1 font-medium">or drag and drop</p>
                  </div>
                  <p className="text-xs font-medium text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
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
