import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  useWindowDimensions,
  KeyboardAvoidingView,
} from 'react-native';

// -----------------------------------------------------------------------------
// CONFIGURATION & PLATFORM DETECTION
// -----------------------------------------------------------------------------
const getDefaultApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------
export default function App() {
  const [user, setUser] = useState(null);
  const [apiUrl, setApiUrl] = useState(getDefaultApiUrl());

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleSignOut = () => {
    setUser(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" />
      <View style={styles.container}>
        {!user ? (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            apiUrl={apiUrl}
            onUpdateApiUrl={setApiUrl}
          />
        ) : (
          <DashboardView
            user={user}
            onSignOut={handleSignOut}
            apiUrl={apiUrl}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// -----------------------------------------------------------------------------
// 1. LOGIN SCREEN (Minimalist Beige & White Fashion Aesthetic)
// -----------------------------------------------------------------------------
function LoginView({ onLoginSuccess, apiUrl, onUpdateApiUrl }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess({
          username: data.admin?.username || username,
          token: data.token,
        });
      } else {
        setErrorMsg(data.message || 'Invalid username or password.');
      }
    } catch (err) {
      // Offline fallback for demo / test without running server
      if (username === 'admin' && password === 'admin123') {
        onLoginSuccess({ username: 'admin', token: 'demo-token' });
      } else {
        setErrorMsg(`Unable to reach backend at ${apiUrl}. Please check your connection.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={loginStyles.wrapper}
    >
      <ScrollView
        contentContainerStyle={loginStyles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[loginStyles.card, { maxWidth: isMobile ? '100%' : 460 }]}>
          {/* Brand Monogram */}
          <View style={loginStyles.brandContainer}>
            <View style={loginStyles.logoBadge}>
              <Text style={loginStyles.logoLetter}>É</Text>
            </View>
            <Text style={loginStyles.brandTitle}>É L A N O R A</Text>
            <Text style={loginStyles.brandSub}>MAISON DE HAUTE COUTURE</Text>
          </View>

          <View style={loginStyles.divider} />

          {/* Form Header */}
          <Text style={loginStyles.formTitle}>Admin Portal Login</Text>
          <Text style={loginStyles.formDesc}>
            Sign in with authorized administrative credentials to manage store collections and stock inventory.
          </Text>

          {/* Error Notice */}
          {errorMsg ? (
            <View style={loginStyles.errorContainer}>
              <Text style={loginStyles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Inputs */}
          <View style={loginStyles.field}>
            <Text style={loginStyles.label}>USERNAME</Text>
            <TextInput
              style={loginStyles.input}
              placeholder="e.g. admin"
              placeholderTextColor="#B0A7A0"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={loginStyles.field}>
            <Text style={loginStyles.label}>PASSWORD</Text>
            <TextInput
              style={loginStyles.input}
              placeholder="••••••••"
              placeholderTextColor="#B0A7A0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[loginStyles.btnPrimary, loading && loginStyles.btnDisabled]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={loginStyles.btnPrimaryText}>SIGN IN</Text>
            )}
          </TouchableOpacity>

          <Text style={loginStyles.credentialHint}>
            Demo credentials: <Text style={loginStyles.bold}>admin</Text> / <Text style={loginStyles.bold}>admin123</Text>
          </Text>

          {/* Server Settings Link */}
          <TouchableOpacity
            style={loginStyles.configToggle}
            onPress={() => setShowConfig(!showConfig)}
          >
            <Text style={loginStyles.configToggleText}>
              {showConfig ? 'Hide Server Configuration' : 'Server Connection Settings'}
            </Text>
          </TouchableOpacity>

          {showConfig && (
            <View style={loginStyles.configBox}>
              <Text style={loginStyles.configLabel}>API Base URL:</Text>
              <TextInput
                style={loginStyles.configInput}
                value={tempUrl}
                onChangeText={setTempUrl}
                placeholder="http://localhost:5000/api"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={loginStyles.configSaveBtn}
                onPress={() => {
                  onUpdateApiUrl(tempUrl);
                  setShowConfig(false);
                }}
              >
                <Text style={loginStyles.configSaveText}>Update API URL</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// -----------------------------------------------------------------------------
// 2. DASHBOARD VIEW (Responsive Header, Beige & White Palette)
// -----------------------------------------------------------------------------
function DashboardView({ user, onSignOut, apiUrl }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);

  // Contextual Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form saving state
  const [savingLoading, setSavingLoading] = useState(false);

  // Toast / feedback message
  const [feedback, setFeedback] = useState(null);

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const showToast = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Fetch products (GET /api/products)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/products`);
      const result = await res.json();
      if (res.ok && result.success) {
        setProducts(result.data || []);
      } else {
        showToast(result.message || 'Failed to retrieve products.', 'error');
      }
    } catch (err) {
      showToast(`Cannot reach backend at ${apiUrl}.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [apiUrl]);

  // Save or update product (POST / PUT)
  const handleSaveProduct = async (formData) => {
    setSavingLoading(true);
    try {
      if (editingProduct && editingProduct._id) {
        // PUT
        const res = await fetch(`${apiUrl}/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (res.ok && result.success) {
          showToast(`"${formData.name}" updated successfully.`);
          setFormModalVisible(false);
          setEditingProduct(null);
          // If the detail modal was showing this product, update it too
          if (detailProduct && detailProduct._id === editingProduct._id) {
            setDetailProduct({ ...editingProduct, ...formData });
          }
          fetchProducts();
        } else {
          showToast(result.message || 'Update failed.', 'error');
        }
      } else {
        // POST
        const res = await fetch(`${apiUrl}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (res.ok && result.success) {
          showToast(`"${formData.name}" added to collection.`);
          setFormModalVisible(false);
          fetchProducts();
        } else {
          showToast(result.message || 'Creation failed.', 'error');
        }
      }
    } catch (err) {
      showToast('Network error while saving product.', 'error');
    } finally {
      setSavingLoading(false);
    }
  };

  // Delete product (DELETE /api/products/:id)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${apiUrl}/products/${deleteTarget._id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (res.ok && result.success) {
        showToast(`Product "${deleteTarget.name}" deleted.`);
        // Close detail modal if the deleted item was currently open
        if (detailProduct && detailProduct._id === deleteTarget._id) {
          setDetailProduct(null);
        }
        setDeleteTarget(null);
        fetchProducts();
      } else {
        showToast(result.message || 'Delete operation failed.', 'error');
      }
    } catch (err) {
      showToast('Network error while deleting product.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered list
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    return products.filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // Stock KPI calculations
  const totalStock = products.reduce((acc, curr) => acc + (Number(curr.soluong) || 0), 0);
  const totalVal = products.reduce(
    (acc, curr) => acc + (Number(curr.price) || 0) * (Number(curr.soluong) || 0),
    0
  );

  return (
    <View style={dashStyles.container}>
      {/* ------------------------------------------------------------- */}
      {/* RESPONSIVE HEADER BAR (Fits neatly on mobile without clipping) */}
      {/* ------------------------------------------------------------- */}
      <View style={[dashStyles.header, isMobile && dashStyles.headerMobile]}>
        <View style={dashStyles.brandSection}>
          <View style={dashStyles.brandBadge}>
            <Text style={dashStyles.brandBadgeText}>É</Text>
          </View>
          <View style={dashStyles.titleWrapper}>
            <Text style={dashStyles.mainTitle}>Fashion Store Management</Text>
            <Text style={dashStyles.subTitle}>ÉLANORA COLLECTION & INVENTORY</Text>
          </View>
        </View>

        <View style={[dashStyles.userSection, isMobile && dashStyles.userSectionMobile]}>
          <View style={dashStyles.userInfoPill}>
            <View style={dashStyles.userDot} />
            <Text style={dashStyles.userName}>{user?.username || 'Admin'}</Text>
          </View>
          <TouchableOpacity
            style={dashStyles.signOutBtn}
            onPress={onSignOut}
            activeOpacity={0.8}
          >
            <Text style={dashStyles.signOutText}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Toast Feedback */}
      {feedback && (
        <View
          style={[
            dashStyles.toast,
            feedback.type === 'error' ? dashStyles.toastError : dashStyles.toastSuccess,
          ]}
        >
          <Text style={dashStyles.toastText}>
            {feedback.type === 'error' ? '— ' : '✓ '}
            {feedback.msg}
          </Text>
        </View>
      )}

      {/* Main Content Area */}
      <ScrollView
        contentContainerStyle={[
          dashStyles.contentScroll,
          { paddingHorizontal: isMobile ? 16 : 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* KPI Summary Cards */}
        <View style={[dashStyles.kpiGrid, isMobile && dashStyles.kpiGridMobile]}>
          <View style={dashStyles.kpiCard}>
            <Text style={dashStyles.kpiLabel}>TOTAL DESIGNS</Text>
            <Text style={dashStyles.kpiValue}>{products.length}</Text>
            <Text style={dashStyles.kpiMeta}>Active in catalogue</Text>
          </View>

          <View style={dashStyles.kpiCard}>
            <Text style={dashStyles.kpiLabel}>STOCK ON HAND</Text>
            <Text style={dashStyles.kpiValue}>{totalStock}</Text>
            <Text style={dashStyles.kpiMeta}>Total units available</Text>
          </View>

          <View style={dashStyles.kpiCard}>
            <Text style={dashStyles.kpiLabel}>INVENTORY VALUATION</Text>
            <Text style={dashStyles.kpiValue}>${totalVal.toLocaleString()}</Text>
            <Text style={dashStyles.kpiMeta}>Estimated retail value</Text>
          </View>
        </View>

        {/* Action / Search Bar */}
        <View style={[dashStyles.actionBar, isMobile && dashStyles.actionBarMobile]}>
          <View style={dashStyles.searchContainer}>
            <Text style={dashStyles.searchIcon}>⌕</Text>
            <TextInput
              style={dashStyles.searchInput}
              placeholder="Search garments by name..."
              placeholderTextColor="#A89F97"
              value={search}
              onChangeText={setSearch}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={dashStyles.clearSearch}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={dashStyles.buttonRow}>
            <TouchableOpacity
              style={dashStyles.btnSecondary}
              onPress={fetchProducts}
              activeOpacity={0.8}
            >
              <Text style={dashStyles.btnSecondaryText}>↻ REFRESH</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={dashStyles.btnPrimary}
              onPress={() => {
                setEditingProduct(null);
                setFormModalVisible(true);
              }}
              activeOpacity={0.85}
            >
              <Text style={dashStyles.btnPrimaryText}>+ NEW PRODUCT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Product List Header Info */}
        <View style={dashStyles.sectionHeaderRow}>
          <Text style={dashStyles.sectionTitle}>
            GARMENT CATALOGUE
            <Text style={dashStyles.sectionCount}> ({filteredProducts.length})</Text>
          </Text>
          <Text style={dashStyles.sectionTip}>
            {isMobile ? 'Tap card for full details' : 'Click on any product to view full details'}
          </Text>
        </View>

        {/* Products Display (Table on Web / Cards on Mobile) */}
        {loading ? (
          <View style={dashStyles.loaderBox}>
            <ActivityIndicator color="#3D312A" size="large" />
            <Text style={dashStyles.loaderText}>Curating inventory...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={dashStyles.emptyCard}>
            <Text style={dashStyles.emptyIcon}>✦</Text>
            <Text style={dashStyles.emptyTitle}>NO GARMENTS FOUND</Text>
            <Text style={dashStyles.emptyDesc}>
              {search
                ? `No apparel pieces matched "${search}".`
                : 'The store catalogue is currently empty. Add your first item.'}
            </Text>
            <TouchableOpacity
              style={dashStyles.btnPrimary}
              onPress={() => {
                setEditingProduct(null);
                setFormModalVisible(true);
              }}
            >
              <Text style={dashStyles.btnPrimaryText}>+ ADD FIRST ITEM</Text>
            </TouchableOpacity>
          </View>
        ) : isMobile ? (
          /* Mobile Card View */
          <View style={dashStyles.mobileList}>
            {filteredProducts.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={dashStyles.mobileCard}
                activeOpacity={0.9}
                onPress={() => setDetailProduct(item)}
              >
                <Image
                  source={{ uri: item.image }}
                  style={dashStyles.mobileImage}
                  resizeMode="cover"
                />
                <View style={dashStyles.mobileBody}>
                  <View>
                    <Text style={dashStyles.productName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={dashStyles.idSubtitle}>
                      ID: {item._id ? `${item._id.substring(0, 8)}...` : '—'}
                    </Text>
                  </View>

                  <View style={dashStyles.mobilePillsRow}>
                    <View style={dashStyles.priceTag}>
                      <Text style={dashStyles.priceTagText}>${item.price}</Text>
                    </View>
                    <View
                      style={[
                        dashStyles.stockPill,
                        item.soluong < 20 && dashStyles.stockPillLow,
                      ]}
                    >
                      <Text
                        style={[
                          dashStyles.stockPillText,
                          item.soluong < 20 && dashStyles.stockPillLowText,
                        ]}
                      >
                        Qty: {item.soluong}
                      </Text>
                    </View>
                  </View>

                  {/* Actions Row */}
                  <View style={dashStyles.cardActionsRow}>
                    <TouchableOpacity
                      style={dashStyles.btnOutline}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        setEditingProduct(item);
                        setFormModalVisible(true);
                      }}
                    >
                      <Text style={dashStyles.btnOutlineText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={dashStyles.btnDangerOutline}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        setDeleteTarget(item);
                      }}
                    >
                      <Text style={dashStyles.btnDangerOutlineText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* Desktop / Web Table View */
          <View style={dashStyles.tableContainer}>
            {/* Table Header */}
            <View style={dashStyles.tableHeader}>
              <Text style={[dashStyles.th, { width: 90 }]}>IMAGE</Text>
              <Text style={[dashStyles.th, { flex: 2 }]}>PRODUCT NAME</Text>
              <Text style={[dashStyles.th, { flex: 1 }]}>PRICE</Text>
              <Text style={[dashStyles.th, { flex: 1 }]}>QUANTITY</Text>
              <Text style={[dashStyles.th, { width: 180, textAlign: 'right' }]}>ACTIONS</Text>
            </View>

            {/* Table Rows */}
            {filteredProducts.map((item, idx) => (
              <TouchableOpacity
                key={item._id || idx}
                style={[
                  dashStyles.tableRow,
                  idx % 2 === 1 && dashStyles.tableRowAlt,
                ]}
                activeOpacity={0.88}
                onPress={() => setDetailProduct(item)}
              >
                {/* Image */}
                <View style={{ width: 90, justifyContent: 'center' }}>
                  <Image
                    source={{ uri: item.image }}
                    style={dashStyles.tableThumb}
                    resizeMode="cover"
                  />
                </View>

                {/* Name & ID */}
                <View style={{ flex: 2, paddingRight: 16 }}>
                  <Text style={dashStyles.tableItemName}>{item.name}</Text>
                  <Text style={dashStyles.tableItemId}>ID: {item._id}</Text>
                </View>

                {/* Price */}
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={dashStyles.tablePrice}>${item.price}</Text>
                </View>

                {/* Quantity (soluong) */}
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <View
                    style={[
                      dashStyles.stockPill,
                      item.soluong < 20 && dashStyles.stockPillLow,
                    ]}
                  >
                    <Text
                      style={[
                        dashStyles.stockPillText,
                        item.soluong < 20 && dashStyles.stockPillLowText,
                      ]}
                    >
                      {item.soluong} in stock
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={dashStyles.tableActionsCell}>
                  <TouchableOpacity
                    style={dashStyles.btnOutline}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      setEditingProduct(item);
                      setFormModalVisible(true);
                    }}
                  >
                    <Text style={dashStyles.btnOutlineText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={dashStyles.btnDangerOutline}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      setDeleteTarget(item);
                    }}
                  >
                    <Text style={dashStyles.btnDangerOutlineText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ------------------------------------------------------------- */}
      {/* 3. PRODUCT DETAIL MODAL (Displays strictly ALL 4 schema fields + _id) */}
      {/* ------------------------------------------------------------- */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onEdit={() => {
            const prod = detailProduct;
            setDetailProduct(null);
            setEditingProduct(prod);
            setFormModalVisible(true);
          }}
          onDelete={() => {
            const prod = detailProduct;
            setDetailProduct(null);
            setDeleteTarget(prod);
          }}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. CONTEXTUAL DELETE CONFIRMATION POPUP OVERLAY */}
      {/* ------------------------------------------------------------- */}
      {deleteTarget && (
        <DeleteConfirmModal
          product={deleteTarget}
          loading={deleteLoading}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Add / Edit Form Modal */}
      {formModalVisible && (
        <ProductFormModal
          visible={formModalVisible}
          initialProduct={editingProduct}
          loading={savingLoading}
          onClose={() => {
            setFormModalVisible(false);
            setEditingProduct(null);
          }}
          onSubmit={handleSaveProduct}
        />
      )}
    </View>
  );
}

// -----------------------------------------------------------------------------
// 3. PRODUCT DETAIL MODAL COMPONENT
// -----------------------------------------------------------------------------
function ProductDetailModal({ product, onClose, onEdit, onDelete }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.backdrop}>
        <View style={[modalStyles.card, { maxWidth: isMobile ? '92%' : 580 }]}>
          {/* Modal Header */}
          <View style={modalStyles.header}>
            <View>
              <Text style={modalStyles.headerCategory}>GARMENT SPECIFICATION</Text>
              <Text style={modalStyles.headerTitle}>Product Details</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeIconBtn}>
              <Text style={modalStyles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.body} showsVerticalScrollIndicator={false}>
            {/* Large Product Image */}
            <View style={modalStyles.imageWrap}>
              <Image
                source={{ uri: product.image }}
                style={modalStyles.detailImage}
                resizeMode="cover"
              />
            </View>

            {/* Field: name */}
            <View style={modalStyles.fieldGroup}>
              <Text style={modalStyles.fieldLabel}>PRODUCT NAME (name)</Text>
              <Text style={modalStyles.fieldValueName}>{product.name}</Text>
            </View>

            {/* Row for price and soluong */}
            <View style={modalStyles.fieldsRow}>
              {/* Field: price */}
              <View style={[modalStyles.fieldGroup, { flex: 1 }]}>
                <Text style={modalStyles.fieldLabel}>UNIT PRICE (price)</Text>
                <Text style={modalStyles.fieldValuePrice}>${product.price}</Text>
              </View>

              {/* Field: soluong */}
              <View style={[modalStyles.fieldGroup, { flex: 1 }]}>
                <Text style={modalStyles.fieldLabel}>STOCK ON HAND (soluong)</Text>
                <View style={modalStyles.stockBadgeDetail}>
                  <Text style={modalStyles.stockBadgeDetailText}>
                    {product.soluong} units available
                  </Text>
                </View>
              </View>
            </View>

            {/* Field: image (URL) */}
            <View style={modalStyles.fieldGroup}>
              <Text style={modalStyles.fieldLabel}>IMAGE URL (image)</Text>
              <View style={modalStyles.codeBox}>
                <Text style={modalStyles.codeText} numberOfLines={2} selectable>
                  {product.image}
                </Text>
              </View>
            </View>

            {/* Field: _id (Database ID) */}
            <View style={modalStyles.fieldGroup}>
              <Text style={modalStyles.fieldLabel}>DATABASE DOCUMENT ID (_id)</Text>
              <View style={modalStyles.codeBox}>
                <Text style={modalStyles.idText} selectable>
                  {product._id}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={modalStyles.footer}>
            <TouchableOpacity style={dashStyles.btnSecondary} onPress={onClose}>
              <Text style={dashStyles.btnSecondaryText}>CLOSE</Text>
            </TouchableOpacity>

            <View style={modalStyles.footerRight}>
              <TouchableOpacity style={dashStyles.btnDangerOutline} onPress={onDelete}>
                <Text style={dashStyles.btnDangerOutlineText}>DELETE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={dashStyles.btnPrimary} onPress={onEdit}>
                <Text style={dashStyles.btnPrimaryText}>EDIT PRODUCT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// -----------------------------------------------------------------------------
// 4. CONTEXTUAL DELETE CONFIRMATION MODAL (Exact Prompt as required)
// -----------------------------------------------------------------------------
function DeleteConfirmModal({ product, loading, onCancel, onConfirm }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={modalStyles.backdrop}>
        <View style={[deleteStyles.card, { maxWidth: isMobile ? '90%' : 440 }]}>
          <View style={deleteStyles.iconBadge}>
            <Text style={deleteStyles.iconBadgeText}>!</Text>
          </View>

          <Text style={deleteStyles.title}>Confirm Deletion</Text>

          {/* Prompt Message (in English) required: "Are you sure you want to delete [Product Name]?" */}
          <Text style={deleteStyles.promptMessage}>
            Are you sure you want to delete{' '}
            <Text style={deleteStyles.productHighlight}>"{product.name}"</Text>?
          </Text>

          <Text style={deleteStyles.warningSub}>
            This action will permanently remove the garment from MongoDB Atlas and cannot be undone.
          </Text>

          <View style={deleteStyles.buttonRow}>
            <TouchableOpacity
              style={deleteStyles.btnCancel}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={deleteStyles.btnCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[deleteStyles.btnDelete, loading && deleteStyles.btnDisabled]}
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={deleteStyles.btnDeleteText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// -----------------------------------------------------------------------------
// 5. PRODUCT ADD / EDIT FORM MODAL
// -----------------------------------------------------------------------------
function ProductFormModal({ visible, initialProduct, loading, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [soluong, setSoluong] = useState('');
  const [image, setImage] = useState('');
  const [imgErr, setImgErr] = useState(false);
  const [err, setErr] = useState('');

  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name || '');
      setPrice(String(initialProduct.price ?? ''));
      setSoluong(String(initialProduct.soluong ?? ''));
      setImage(initialProduct.image || '');
    } else {
      setName('');
      setPrice('');
      setSoluong('');
      setImage('');
    }
    setImgErr(false);
    setErr('');
  }, [initialProduct, visible]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setErr('Product name is required.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0 || price === '') {
      setErr('Price must be a valid number >= 0.');
      return;
    }
    const numSoluong = Number(soluong);
    if (isNaN(numSoluong) || numSoluong < 0 || soluong === '') {
      setErr('Quantity (soluong) must be a valid number >= 0.');
      return;
    }
    if (!image.trim()) {
      setErr('Product image URL is required.');
      return;
    }

    setErr('');
    onSubmit({
      name: name.trim(),
      price: numPrice,
      soluong: numSoluong,
      image: image.trim(),
    });
  };

  const isEdit = !!initialProduct;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.backdrop}>
        <View style={[modalStyles.card, { maxWidth: isMobile ? '92%' : 540 }]}>
          <View style={modalStyles.header}>
            <View>
              <Text style={modalStyles.headerCategory}>
                {isEdit ? 'EDIT COLLECTION ITEM' : 'NEW GARMENT ENTRY'}
              </Text>
              <Text style={modalStyles.headerTitle}>
                {isEdit ? 'Update Garment' : 'Add New Product'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeIconBtn}>
              <Text style={modalStyles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.body} showsVerticalScrollIndicator={false}>
            {err ? (
              <View style={loginStyles.errorContainer}>
                <Text style={loginStyles.errorText}>{err}</Text>
              </View>
            ) : null}

            {/* Field: name */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>
                PRODUCT NAME (name) <Text style={formStyles.req}>*</Text>
              </Text>
              <TextInput
                style={formStyles.input}
                placeholder="e.g. Classic Trench Coat"
                placeholderTextColor="#A89F97"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Row: price & soluong */}
            <View style={[formStyles.row, isMobile && formStyles.rowMobile]}>
              <View style={[formStyles.field, { flex: 1, marginRight: isMobile ? 0 : 8 }]}>
                <Text style={formStyles.label}>
                  PRICE ($) <Text style={formStyles.req}>*</Text>
                </Text>
                <TextInput
                  style={formStyles.input}
                  placeholder="e.g. 140"
                  placeholderTextColor="#A89F97"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>

              <View style={[formStyles.field, { flex: 1, marginLeft: isMobile ? 0 : 8 }]}>
                <Text style={formStyles.label}>
                  QUANTITY (soluong) <Text style={formStyles.req}>*</Text>
                </Text>
                <TextInput
                  style={formStyles.input}
                  placeholder="e.g. 50"
                  placeholderTextColor="#A89F97"
                  keyboardType="numeric"
                  value={soluong}
                  onChangeText={setSoluong}
                />
              </View>
            </View>

            {/* Field: image */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>
                IMAGE URL (image) <Text style={formStyles.req}>*</Text>
              </Text>
              <TextInput
                style={formStyles.input}
                placeholder="https://images.unsplash.com/..."
                placeholderTextColor="#A89F97"
                value={image}
                onChangeText={(t) => {
                  setImage(t);
                  setImgErr(false);
                }}
                autoCapitalize="none"
              />
            </View>

            {/* Image Preview */}
            <View style={formStyles.previewBox}>
              <Text style={formStyles.previewLabel}>IMAGE PREVIEW</Text>
              <View style={formStyles.previewFrame}>
                {image && !imgErr ? (
                  <Image
                    source={{ uri: image }}
                    style={formStyles.previewImg}
                    resizeMode="cover"
                    onError={() => setImgErr(true)}
                  />
                ) : (
                  <View style={formStyles.previewPlaceholder}>
                    <Text style={formStyles.previewEmptyText}>
                      {imgErr ? 'Could not load image from URL' : 'Image preview will appear here'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={modalStyles.footer}>
            <TouchableOpacity style={dashStyles.btnSecondary} onPress={onClose} disabled={loading}>
              <Text style={dashStyles.btnSecondaryText}>CANCEL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[dashStyles.btnPrimary, loading && dashStyles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={dashStyles.btnPrimaryText}>
                  {isEdit ? 'SAVE CHANGES' : 'CREATE GARMENT'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// -----------------------------------------------------------------------------
// STYLES: THEME ÉLANORA (Minimalist Beige & White Fashion Aesthetic)
// -----------------------------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F5', // Light beige
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
});

const loginStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF', // Clean white
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFECE6', // Subtle border
    padding: 36,
    shadowColor: '#2C2623',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 3,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3D312A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoLetter: {
    color: '#FAF8F5',
    fontSize: 20,
    fontWeight: '300',
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
  },
  brandTitle: {
    fontSize: 16,
    letterSpacing: 6,
    fontWeight: '700',
    color: '#2C2623', // Dark warm brown
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
  },
  brandSub: {
    fontSize: 9,
    letterSpacing: 2,
    color: '#8C827A', // Warm gray
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFECE6',
    marginVertical: 18,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C2623',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    marginBottom: 8,
  },
  formDesc: {
    fontSize: 13,
    color: '#8C827A',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FDF2F2',
    borderWidth: 1,
    borderColor: '#F8D7DA',
    borderRadius: 6,
    padding: 10,
    marginBottom: 18,
  },
  errorText: {
    color: '#9C3636',
    fontSize: 12,
    textAlign: 'center',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#8C827A',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E0D8',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#2C2623',
  },
  btnPrimary: {
    backgroundColor: '#3D312A', // Deep fashion brown
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    letterSpacing: 2,
    fontWeight: '700',
  },
  credentialHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#A89F97',
    marginTop: 18,
  },
  bold: {
    fontWeight: '700',
    color: '#2C2623',
  },
  configToggle: {
    marginTop: 18,
    alignItems: 'center',
  },
  configToggleText: {
    fontSize: 11,
    color: '#8C827A',
    textDecorationLine: 'underline',
  },
  configBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EFECE6',
    borderRadius: 6,
  },
  configLabel: {
    fontSize: 11,
    color: '#8C827A',
    fontWeight: '600',
    marginBottom: 6,
  },
  configInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E0D8',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#2C2623',
    marginBottom: 8,
  },
  configSaveBtn: {
    backgroundColor: '#EFECE6',
    paddingVertical: 7,
    borderRadius: 4,
    alignItems: 'center',
  },
  configSaveText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2C2623',
  },
});

const dashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  // Responsive Header Bar
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFECE6',
    paddingHorizontal: 28,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerMobile: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#3D312A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandBadgeText: {
    color: '#FAF8F5',
    fontSize: 18,
    fontWeight: '300',
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
  },
  titleWrapper: {
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C2623',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
  },
  subTitle: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '600',
    color: '#8C827A',
    marginTop: 2,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userSectionMobile: {
    alignSelf: 'flex-end',
  },
  userInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EFECE6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  userDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#52796F',
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C2623',
  },
  signOutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E0D8',
    backgroundColor: '#FFFFFF',
  },
  signOutText: {
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '700',
    color: '#8C827A',
  },
  toast: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  toastSuccess: {
    backgroundColor: '#E8EDE7',
  },
  toastError: {
    backgroundColor: '#FBEBEB',
  },
  toastText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C2623',
  },
  contentScroll: {
    paddingVertical: 24,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  kpiGridMobile: {
    flexDirection: 'column',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFECE6',
    borderRadius: 8,
    padding: 18,
    shadowColor: '#2C2623',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#8C827A',
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2C2623',
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
  },
  kpiMeta: {
    fontSize: 11,
    color: '#A89F97',
    marginTop: 4,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  actionBarMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFECE6',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 8 : 4,
  },
  searchIcon: {
    fontSize: 18,
    color: '#8C827A',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#2C2623',
  },
  clearSearch: {
    fontSize: 12,
    color: '#8C827A',
    paddingHorizontal: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: '#3D312A', // Deep fashion brown
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
  },
  btnSecondary: {
    backgroundColor: '#F3EFEA', // Soft beige/gray
    borderWidth: 1,
    borderColor: '#EFECE6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    color: '#2C2623',
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: '#D8D1C7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  btnOutlineText: {
    color: '#2C2623',
    fontSize: 11,
    fontWeight: '600',
  },
  btnDangerOutline: {
    borderWidth: 1,
    borderColor: '#EBC4C4',
    backgroundColor: '#FDF7F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  btnDangerOutlineText: {
    color: '#9C3636',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#2C2623',
  },
  sectionCount: {
    color: '#8C827A',
    fontWeight: '400',
  },
  sectionTip: {
    fontSize: 11,
    color: '#8C827A',
    fontStyle: 'italic',
  },
  loaderBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 13,
    color: '#8C827A',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFECE6',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 28,
    color: '#8C827A',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: '700',
    color: '#2C2623',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#8C827A',
    textAlign: 'center',
    marginBottom: 18,
  },
  // Desktop Table
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFECE6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F6F2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EFECE6',
  },
  th: {
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '700',
    color: '#8C827A',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF8F5',
  },
  tableRowAlt: {
    backgroundColor: '#FCFAF7',
  },
  tableThumb: {
    width: 54,
    height: 64,
    borderRadius: 4,
    backgroundColor: '#EFECE6',
  },
  tableItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C2623',
  },
  tableItemId: {
    fontSize: 11,
    color: '#A89F97',
    marginTop: 3,
  },
  tablePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C2623',
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
  },
  stockPill: {
    backgroundColor: '#F3EFEA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  stockPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5C544E',
  },
  stockPillLow: {
    backgroundColor: '#FDF1EB',
  },
  stockPillLowText: {
    color: '#B55B2E',
  },
  tableActionsCell: {
    width: 180,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  // Mobile Card List
  mobileList: {
    gap: 12,
  },
  mobileCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFECE6',
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#2C2623',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  mobileImage: {
    width: 105,
    height: '100%',
    minHeight: 125,
    backgroundColor: '#EFECE6',
  },
  mobileBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C2623',
    marginBottom: 2,
  },
  idSubtitle: {
    fontSize: 10,
    color: '#A89F97',
  },
  mobilePillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  priceTag: {
    backgroundColor: '#3D312A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-start',
  },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(44, 38, 35, 0.45)', // Warm dark backdrop
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFECE6',
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#2C2623',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EFECE6',
  },
  headerCategory: {
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '700',
    color: '#8C827A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2623',
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    marginTop: 2,
  },
  closeIconBtn: {
    padding: 6,
  },
  closeIcon: {
    fontSize: 16,
    color: '#8C827A',
    fontWeight: '600',
  },
  body: {
    padding: 24,
  },
  imageWrap: {
    width: '100%',
    height: 240,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EFECE6',
    marginBottom: 20,
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
    color: '#8C827A',
    marginBottom: 4,
  },
  fieldValueName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C2623',
  },
  fieldValuePrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3D312A',
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
  },
  stockBadgeDetail: {
    backgroundColor: '#F3EFEA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  stockBadgeDetailText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C2623',
  },
  codeBox: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EFECE6',
    borderRadius: 4,
    padding: 8,
  },
  codeText: {
    fontSize: 11,
    color: '#5C544E',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  idText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3D312A',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFECE6',
    backgroundColor: '#FFFFFF',
  },
  footerRight: {
    flexDirection: 'row',
    gap: 10,
  },
});

const deleteStyles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFECE6',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#2C2623',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDF2F2',
    borderWidth: 1,
    borderColor: '#F8D7DA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBadgeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9C3636',
  },
  title: {
    fontSize: 16,
    letterSpacing: 1,
    fontWeight: '700',
    color: '#2C2623',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
  },
  promptMessage: {
    fontSize: 14,
    color: '#2C2623',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  productHighlight: {
    fontWeight: '700',
    color: '#3D312A',
  },
  warningSub: {
    fontSize: 11,
    color: '#8C827A',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btnCancel: {
    flex: 1,
    backgroundColor: '#F3EFEA',
    borderWidth: 1,
    borderColor: '#EFECE6',
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnCancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C2623',
    letterSpacing: 0.5,
  },
  btnDelete: {
    flex: 1,
    backgroundColor: '#9C3636',
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnDeleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

const formStyles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  rowMobile: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
    color: '#8C827A',
    marginBottom: 6,
  },
  req: {
    color: '#9C3636',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E0D8',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#2C2623',
  },
  previewBox: {
    marginTop: 8,
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
    color: '#8C827A',
    marginBottom: 6,
  },
  previewFrame: {
    height: 160,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EFECE6',
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    alignItems: 'center',
    padding: 16,
  },
  previewEmptyText: {
    fontSize: 12,
    color: '#A89F97',
  },
});
