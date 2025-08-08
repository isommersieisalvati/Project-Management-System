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

  useEffect(() => {
    dispatch(fetchProducts({ search: searchTerm, sortBy, sortOrder }));
  }, [dispatch, searchTerm, sortBy, sortOrder]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
    setCurrentPage(1);
  };

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
    return <span>{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  if (isLoading) {
    return (
      <div>
        <div>
          <div></div>
          <span>Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div>
        <div>
          <h2>Products</h2>
          <p>{filteredProducts.length} products found</p>
        </div>
        <div>
          {user?.role === "admin" && (
            <>
              <button onClick={() => setShowDeleted(!showDeleted)}>
                {showDeleted ? "Hide Deleted" : "Show Deleted"}
              </button>
              <Link to="/products/new">
                <span>+</span>
                Add Product
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div>
        <div>
          <div>
            <div>
              <label htmlFor="search">Search products</label>
              <div>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div>
              <label>Sort by</label>
              <div>
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
        <div>
          <div>
            <div>
              <span>⚠️</span>
            </div>
            <div>
              <h3>Error loading products</h3>
              <div>
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {paginatedProducts.length === 0 ? (
        <div>
          <div>📦</div>
          <h3>No products found</h3>
          <p>
            {searchTerm
              ? "Try adjusting your search terms."
              : "Get started by adding a new product."}
          </p>
          {user?.role === "admin" && !searchTerm && (
            <div>
              <Link to="/products/new">
                <span>+</span>
                Add your first product
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div>
          {paginatedProducts.map((product) => (
            <div key={product.id}>
              <div>
                {product.image_url ? (
                  <img
                    src={`http://localhost:3001${product.image_url}`}
                    alt={product.name}
                  />
                ) : (
                  <div>
                    <span>🖼️</span>
                  </div>
                )}
              </div>
              <div>
                <div>
                  <div>
                    <h3>
                      {product.name}
                      {product.is_deleted && <span>Deleted</span>}
                    </h3>
                    <p>{product.description}</p>
                  </div>
                </div>
                <div>
                  <span>${Number(product.price).toFixed(2)}</span>
                  <div>
                    {user?.role === "admin" && !product.is_deleted && (
                      <>
                        <Link
                          to={`/products/edit/${product.id}`}
                          title="Edit product"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          title="Delete product"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div>
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
        <div>
          <div>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
          <div>
            <div>
              <p>
                Showing <span>{startIndex + 1}</span> to{" "}
                <span>
                  {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
                </span>{" "}
                of <span>{filteredProducts.length}</span> results
              </p>
            </div>
            <div>
              <nav>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                ></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button key={page} onClick={() => setCurrentPage(page)}>
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                ></button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div>
          <div>
            <div>
              <div>
                <span>⚠️</span>
              </div>
              <h3>Delete Product</h3>
              <div>
                <p>
                  Are you sure you want to delete this product? This action
                  cannot be undone.
                </p>
              </div>
              <div>
                <button onClick={() => handleDelete(deleteConfirm)}>
                  Delete
                </button>
                <button onClick={() => setDeleteConfirm(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
