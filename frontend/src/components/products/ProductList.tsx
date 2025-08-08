import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchProducts,
  deleteProduct,
  setSearchTerm,
  setSortBy,
  setSortOrder,
} from "../../store/slices/productSlice";
import type { AppDispatch, RootState } from "../../store";

const ProductList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { products, isLoading, error, searchTerm, sortBy, sortOrder } =
    useSelector((state: RootState) => state.products);

  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const itemsPerPage = 12;

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Update local state when Redux searchTerm changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    dispatch(setSearchTerm(localSearchTerm));
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  useEffect(() => {
    dispatch(fetchProducts({ search: searchTerm, sortBy, sortOrder }));
  }, [dispatch, searchTerm, sortBy, sortOrder]);

  const handleSort = (field: "name" | "price" | "createdAt") => {
    if (sortBy === field) {
      dispatch(setSortOrder(sortOrder === "asc" ? "desc" : "asc"));
    } else {
      dispatch(setSortBy(field));
      dispatch(setSortOrder("asc"));
    }
    setCurrentPage(1);
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteProduct(id));
      setDeleteConfirm(null);
      // Refresh the list
      dispatch(fetchProducts({ search: searchTerm, sortBy, sortOrder }));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // Filter products based on deleted status
  const filteredProducts = products.filter((product) =>
    showDeleted ? true : !product.is_deleted
  );

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return null;
    }
    return <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="flex items-center">
          <div className="border-solid border-2 border-gray-300 rounded-md p-4 mr-2 bg-white"></div>
          <span className="font-serif text-lg">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-row justify-between items-center mb-4">
          <h2 className="font-mono text-2xl font-bold">Products</h2>
          <p className="text-[rgb(229,229,229)] font-serif text-sm">
            {filteredProducts.length} products found
          </p>
        </div>
        <div className="flex flex-row gap-4">
          {user?.role === "admin" && (
            <>
              <button
                onClick={() => setShowDeleted(!showDeleted)}
                className="border-solid border-2 border-gray-300 rounded-md p-2 mr-2 text-sm"
              >
                {showDeleted ? "Hide Deleted" : "Show Deleted"}
              </button>
              <Link
                to="/products/new"
                className="border-solid border-2 border-gray-300 rounded-md p-2 mr-2 text-sm flex items-center"
              >
                <span className="mr-1">+</span>
                Add Product
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="bg-white rounded-md border-solid border-2 border-gray-300 p-4 mr-2">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <label
                htmlFor="search"
                className="font-serif text-sm font-bold mb-2 block"
              >
                Search products
              </label>
              <div className="flex flex-row gap-2 w-full">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name or description..."
                  value={localSearchTerm}
                  onChange={handleSearchInput}
                  onKeyPress={handleKeyPress}
                  className="flex-1 border-solid border-2 border-gray-300 rounded-md p-2"
                />
                <button
                  onClick={handleSearchSubmit}
                  className="border-solid border-2 border-gray-300 rounded-md p-2 text-sm flex items-center"
                >
                  <span className="mr-1">🔍</span>
                  Search
                </button>
              </div>
            </div>
            <div className="w-full">
              <label className="font-serif text-sm font-bold mb-2 block">
                Sort by
              </label>
              <div className="flex flex-row gap-2">
                {[
                  { key: "name", label: "Name" },
                  { key: "price", label: "Price" },
                  { key: "createdAt", label: "Date" },
                ].map((sort) => (
                  <button
                    key={sort.key}
                    onClick={() =>
                      handleSort(sort.key as "name" | "price" | "createdAt")
                    }
                    className="border-solid border-2 border-gray-300 rounded-md p-2 mr-2 text-sm flex items-center"
                  >
                    {sort.label}
                    {getSortIcon(sort.key)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <div className="bg-red-50 border-solid border-2 border-red-300 rounded-md p-4 mr-2">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
            </div>
            <div className="ml-2">
              <h3 className="font-bold text-lg">Error loading products</h3>
              <div className="mt-1">
                <p className="font-serif text-sm">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {paginatedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white border-solid border-2 border-gray-300 rounded-md mr-2">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="font-mono text-xl font-bold mb-2">
            No products found
          </h3>
          <p className="font-serif text-center mb-4">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Get started by adding a new product."}
          </p>
          {user?.role === "admin" && !searchTerm && (
            <div className="mt-4">
              <Link
                to="/products/new"
                className="border-solid border-2 border-gray-300 rounded-md p-2 mr-2 flex items-center"
              >
                <span className="mr-1">+</span>
                Add your first product
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border-solid border-2 border-gray-300 rounded-md p-4 mr-2"
            >
              <div className="mb-4">
                {product.image_url ? (
                  <img
                    src={`http://localhost:3001${product.image_url}`}
                    alt={product.name}
                    className="w-full h-48 object-cover border-solid border-2 border-gray-300 rounded-md"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 border-solid border-2 border-gray-300 rounded-md flex items-center justify-center">
                    <span className="text-4xl">🖼️</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <div className="mb-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-mono text-lg font-bold">
                      {product.name}
                      {product.is_deleted && (
                        <span className="ml-2 text-red-500 text-sm">
                          Deleted
                        </span>
                      )}
                    </h3>
                  </div>
                  <p className="font-serif text-sm mt-1">
                    {product.description}
                  </p>
                </div>
                <div className="flex flex-row justify-between items-center mb-3">
                  <span className="font-bold text-lg">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <div className="flex flex-row gap-2">
                    {user?.role === "admin" && !product.is_deleted && (
                      <>
                        <Link
                          to={`/products/edit/${product.id}`}
                          title="Edit product"
                          className="border-solid border-2 border-gray-300 rounded-md p-1 text-xs"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          title="Delete product"
                          className="border-solid border-2 border-red-300 rounded-md p-1 text-xs bg-red-50"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-xs font-serif text-gray-600">
                  Created:{" "}
                  {new Date(
                    product.created_at || product.createdAt
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <div className="flex flex-row justify-between items-center mb-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="border-solid border-2 border-gray-300 rounded-md p-2 mr-2 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="border-solid border-2 border-gray-300 rounded-md p-2 mr-2 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="bg-white border-solid border-2 border-gray-300 rounded-md p-4 mr-2">
            <div className="flex flex-col items-center gap-4">
              <p className="font-serif text-sm">
                Showing <span className="font-bold">{startIndex + 1}</span> to{" "}
                <span className="font-bold">
                  {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
                </span>{" "}
                of <span className="font-bold">{filteredProducts.length}</span>{" "}
                results
              </p>
            </div>
            <div className="flex justify-center mt-4">
              <nav className="flex flex-row gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="border-solid border-2 border-gray-300 rounded-md p-2 text-sm disabled:opacity-50"
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`border-solid border-2 border-gray-300 rounded-md p-2 text-sm ${
                        currentPage === page
                          ? "bg-[rgb(3,4,95)] text-white"
                          : ""
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="border-solid border-2 border-gray-300 rounded-md p-2 text-sm disabled:opacity-50"
                >
                  →
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white border-solid border-2 border-gray-300 rounded-md p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="mr-3">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="font-mono text-xl font-bold">Delete Product</h3>
            </div>
            <div className="mb-6">
              <p className="font-serif">
                Are you sure you want to delete this product? This action cannot
                be undone.
              </p>
            </div>
            <div className="flex flex-row gap-3 justify-end">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="border-solid border-2 border-red-300 rounded-md p-2 text-sm bg-red-50"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="border-solid border-2 border-gray-300 rounded-md p-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
