import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  Platform,
} from 'react-native';
import ProductModal from '../components/ProductModal';

export default function DashboardScreen({ user, onSignOut, apiUrl }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [alertBanner, setAlertBanner] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Show a temporary banner notification
  const notify = (message, type = 'success') => {
    setAlertBanner({ message, type });
    setTimeout(() => {
      setAlertBanner(null);
    }, 4000);
  };

  // 1. GET /api/products - Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/products`);
      const result = await res.json();

      if (res.ok && result.success) {
        setProducts(result.data || []);
      } else {
        notify(result.message || 'Failed to load products.', 'error');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      notify(`Cannot connect to Backend API at ${apiUrl}.`, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [apiUrl]);

  // 2. POST /api/products or PUT /api/products/:id
  const handleSaveProduct = async (productData) => {
    setSavingProduct(true);
    try {
      if (editingProduct && editingProduct._id) {
        // UPDATE: PUT /api/products/:id
        const res = await fetch(`${apiUrl}/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        const result = await res.json();
        if (res.ok && result.success) {
          notify(`Updated "${productData.name}" successfully!`, 'success');
          setModalVisible(false);
          setEditingProduct(null);
          fetchProducts();
        } else {
          notify(result.message || 'Failed to update product.', 'error');
        }
      } else {
        // CREATE: POST /api/products
        const res = await fetch(`${apiUrl}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        const result = await res.json();
        if (res.ok && result.success) {
          notify(`Added "${productData.name}" successfully!`, 'success');
          setModalVisible(false);
          fetchProducts();
        } else {
          notify(result.message || 'Failed to create product.', 'error');
        }
      }
    } catch (err) {
      console.error('Error saving product:', err);
      notify('Network error when saving product.', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  // 3. DELETE /api/products/:id
  const handleDeleteProduct = async (id, name) => {
    try {
      const res = await fetch(`${apiUrl}/products/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (res.ok && result.success) {
        notify(`Deleted product "${name}" successfully!`, 'success');
        setDeleteConfirmId(null);
        fetchProducts();
      } else {
        notify(result.message || 'Failed to delete product.', 'error');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      notify('Network error when deleting product.', 'error');
    }
  };

  const confirmDelete = (item) => {
    if (Platform.OS === 'web') {
      setDeleteConfirmId(item._id);
    } else {
      Alert.alert(
        'Confirm Delete',
        `Are you sure you want to delete "${item.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => handleDeleteProduct(item._id, item.name),
          },
        ]
      );
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingProduct(item);
    setModalVisible(true);
  };

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Inventory stats
  const totalStock = products.reduce((acc, curr) => acc + (Number(curr.soluong) || 0), 0);
  const totalValue = products.reduce(
    (acc, curr) => acc + (Number(curr.price) || 0) * (Number(curr.soluong) || 0),
    0
  );

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <Text style={styles.navLogo}>🛍️</Text>
          <View>
            <Text style={styles.navTitle}>Fashion Store Management</Text>
            <Text style={styles.navSubtitle}>Admin Control Panel</Text>
          </View>
        </View>

        <View style={styles.navRight}>
          <View style={styles.userBadge}>
            <Text style={styles.userIcon}>👤</Text>
            <Text style={styles.userName}>{user?.username || 'Admin'}</Text>
          </View>
          <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Alert Banner */}
      {alertBanner ? (
        <View
          style={[
            styles.banner,
            alertBanner.type === 'error' ? styles.bannerError : styles.bannerSuccess,
          ]}
        >
          <Text style={styles.bannerText}>
            {alertBanner.type === 'error' ? '❌' : '✅'} {alertBanner.message}
          </Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* KPI Summary Cards */}
        <View style={[styles.statsRow, isMobile && styles.statsColumn]}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Products</Text>
            <Text style={styles.statValue}>{products.length}</Text>
            <Text style={styles.statSub}>In collection</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Stock (soluong)</Text>
            <Text style={styles.statValue}>{totalStock}</Text>
            <Text style={styles.statSub}>Units available</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Inventory Value</Text>
            <Text style={styles.statValue}>${totalValue.toLocaleString()}</Text>
            <Text style={styles.statSub}>Total asset value</Text>
          </View>
        </View>

        {/* Action Bar: Search & Add Product */}
        <View style={[styles.actionBar, isMobile && styles.actionBarMobile]}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search fashion products by name..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.actionButtonsGroup}>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={() => {
                setRefreshing(true);
                fetchProducts();
              }}
            >
              <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
              <Text style={styles.addBtnText}>+ Add New Product</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delete Confirmation Banner on Web */}
        {deleteConfirmId ? (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>
              Are you sure you want to permanently delete this product?
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setDeleteConfirmId(null)}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={() => {
                  const target = products.find((p) => p._id === deleteConfirmId);
                  handleDeleteProduct(deleteConfirmId, target?.name || 'Product');
                }}
              >
                <Text style={styles.confirmDeleteText}>Confirm Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Products List Area */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text style={styles.loadingText}>Loading fashion products...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? `No products match "${searchQuery}".`
                : 'Your fashion inventory is currently empty. Click "Add New Product" to get started.'}
            </Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddModal}>
              <Text style={styles.emptyAddBtnText}>+ Add Your First Product</Text>
            </TouchableOpacity>
          </View>
        ) : isMobile ? (
          /* Mobile Card Layout */
          <View style={styles.mobileList}>
            {filteredProducts.map((item) => (
              <View key={item._id} style={styles.mobileCard}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.mobileCardImage}
                  resizeMode="cover"
                />
                <View style={styles.mobileCardContent}>
                  <Text style={styles.mobileCardName} numberOfLines={2}>
                    {item.name}
                  </Text>

                  <View style={styles.mobileBadgesRow}>
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceBadgeText}>${item.price}</Text>
                    </View>
                    <View style={styles.stockBadge}>
                      <Text style={styles.stockBadgeText}>
                        Stock: {item.soluong}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.mobileActionsRow}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => openEditModal(item)}
                    >
                      <Text style={styles.editBtnText}>✏️ Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => confirmDelete(item)}
                    >
                      <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          /* Web PC Table Layout */
          <View style={styles.tableCard}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, styles.colImage]}>Image</Text>
              <Text style={[styles.th, styles.colName]}>Product Name</Text>
              <Text style={[styles.th, styles.colPrice]}>Price</Text>
              <Text style={[styles.th, styles.colStock]}>Quantity (soluong)</Text>
              <Text style={[styles.th, styles.colActions]}>Actions</Text>
            </View>

            {/* Table Rows */}
            {filteredProducts.map((item, index) => (
              <View
                key={item._id || index}
                style={[
                  styles.tableRow,
                  index % 2 === 1 && styles.tableRowAlt,
                ]}
              >
                {/* Column 1: Image */}
                <View style={[styles.td, styles.colImage]}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.tableImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Column 2: Product Name */}
                <View style={[styles.td, styles.colName]}>
                  <Text style={styles.productNameText}>{item.name}</Text>
                  <Text style={styles.productIdText}>ID: {item._id}</Text>
                </View>

                {/* Column 3: Price */}
                <View style={[styles.td, styles.colPrice]}>
                  <Text style={styles.priceText}>${item.price}</Text>
                </View>

                {/* Column 4: Quantity (soluong) */}
                <View style={[styles.td, styles.colStock]}>
                  <View
                    style={[
                      styles.stockPill,
                      item.soluong < 20 ? styles.stockPillLow : styles.stockPillNormal,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stockPillText,
                        item.soluong < 20
                          ? styles.stockPillLowText
                          : styles.stockPillNormalText,
                      ]}
                    >
                      {item.soluong} units
                    </Text>
                  </View>
                </View>

                {/* Column 5: Actions */}
                <View style={[styles.td, styles.colActions, styles.actionsRow]}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => openEditModal(item)}
                  >
                    <Text style={styles.editBtnText}>✏️ Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => confirmDelete(item)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add / Edit Product Modal */}
      <ProductModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        initialProduct={editingProduct}
        loading={savingProduct}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  navbar: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navLogo: {
    fontSize: 28,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  navSubtitle: {
    fontSize: 11,
    color: '#38bdf8',
    letterSpacing: 1,
    fontWeight: '600',
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  userIcon: {
    fontSize: 14,
  },
  userName: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  signOutBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  signOutText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '600',
  },
  banner: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bannerSuccess: {
    backgroundColor: '#065f46',
  },
  bannerError: {
    backgroundColor: '#991b1b',
  },
  bannerText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statsColumn: {
    flexDirection: 'column',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 4,
  },
  statSub: {
    fontSize: 12,
    color: '#64748b',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  actionBarMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 8 : 4,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 14,
  },
  clearSearch: {
    color: '#94a3b8',
    fontSize: 14,
    paddingHorizontal: 6,
  },
  actionButtonsGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  refreshBtn: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtnText: {
    color: '#cbd5e1',
    fontWeight: '600',
    fontSize: 13,
  },
  addBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  confirmBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  confirmText: {
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmCancelBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmCancelText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  confirmDeleteBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmDeleteText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  tableCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  th: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#243247',
  },
  tableRowAlt: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  td: {
    justifyContent: 'center',
  },
  colImage: {
    width: 80,
  },
  colName: {
    flex: 2,
    paddingRight: 16,
  },
  colPrice: {
    flex: 1,
  },
  colStock: {
    flex: 1,
  },
  colActions: {
    width: 170,
    alignItems: 'flex-end',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  tableImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#0f172a',
  },
  productNameText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  productIdText: {
    color: '#64748b',
    fontSize: 11,
  },
  priceText: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '700',
  },
  stockPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  stockPillNormal: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  stockPillNormalText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '600',
  },
  stockPillLow: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  stockPillLowText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '600',
  },
  editBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  editBtnText: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  deleteBtnText: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '600',
  },
  mobileList: {
    gap: 16,
  },
  mobileCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  mobileCardImage: {
    width: 110,
    height: '100%',
    minHeight: 110,
    backgroundColor: '#0f172a',
  },
  mobileCardContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  mobileCardName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  mobileBadgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  priceBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priceBadgeText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  stockBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockBadgeText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  mobileActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 14,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 400,
    marginBottom: 20,
    lineHeight: 18,
  },
  emptyAddBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyAddBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
