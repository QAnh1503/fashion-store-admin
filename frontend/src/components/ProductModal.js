import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';

export default function ProductModal({
  visible,
  onClose,
  onSubmit,
  initialProduct,
  loading,
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [soluong, setSoluong] = useState('');
  const [image, setImage] = useState('');
  const [imageError, setImageError] = useState(false);
  const [validationError, setValidationError] = useState('');

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
    setImageError(false);
    setValidationError('');
  }, [initialProduct, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      setValidationError('Please enter a product name.');
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0 || price === '') {
      setValidationError('Please enter a valid price (greater than or equal to 0).');
      return;
    }

    const numSoluong = Number(soluong);
    if (isNaN(numSoluong) || numSoluong < 0 || soluong === '') {
      setValidationError('Please enter a valid quantity / stock (greater than or equal to 0).');
      return;
    }

    if (!image.trim()) {
      setValidationError('Please enter an image URL.');
      return;
    }

    setValidationError('');
    // Submit only the exact 4 required fields
    onSubmit({
      name: name.trim(),
      price: numPrice,
      soluong: numSoluong,
      image: image.trim(),
    });
  };

  const isEditing = !!initialProduct;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { width: isMobile ? '92%' : 540 }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {isEditing ? '✏️ Edit Fashion Product' : '✨ Add New Product'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {isEditing
                  ? 'Update the 4 required attributes below'
                  : 'Fill in all 4 mandatory attributes (name, price, soluong, image)'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Validation alert */}
            {validationError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {validationError}</Text>
              </View>
            ) : null}

            {/* Field 1: Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Product Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Slim Fit Oxford Shirt"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Row with Price and Quantity (soluong) */}
            <View style={[styles.row, isMobile && styles.column]}>
              {/* Field 2: Price */}
              <View style={[styles.formGroup, { flex: 1, marginRight: isMobile ? 0 : 8 }]}>
                <Text style={styles.label}>
                  Price ($) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 55"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>

              {/* Field 3: Quantity (soluong) */}
              <View style={[styles.formGroup, { flex: 1, marginLeft: isMobile ? 0 : 8 }]}>
                <Text style={styles.label}>
                  Quantity (soluong) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 60"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={soluong}
                  onChangeText={setSoluong}
                />
              </View>
            </View>

            {/* Field 4: Image URL */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Image URL (image) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="https://images.unsplash.com/photo-..."
                placeholderTextColor="#9ca3af"
                value={image}
                onChangeText={(text) => {
                  setImage(text);
                  setImageError(false);
                }}
                autoCapitalize="none"
              />
            </View>

            {/* Live Image Preview */}
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Live Image Preview:</Text>
              <View style={styles.imagePreviewBox}>
                {image && !imageError ? (
                  <Image
                    source={{ uri: image }}
                    style={styles.previewImage}
                    resizeMode="cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <View style={styles.placeholderBox}>
                    <Text style={styles.placeholderEmoji}>🖼️</Text>
                    <Text style={styles.placeholderText}>
                      {imageError ? 'Unable to load image URL' : 'No image URL provided yet'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Modal Footer Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.btnDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {isEditing ? 'Save Changes' : 'Create Product'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  required: {
    color: '#f43f5e',
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
  },
  previewContainer: {
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
  },
  imagePreviewBox: {
    height: 140,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  placeholderText: {
    color: '#64748b',
    fontSize: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  cancelBtnText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
