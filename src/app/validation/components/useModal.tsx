"use client";
import { useState } from 'react';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isConfirm?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const useModal = () => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: 'Information',
    message: '',
    type: 'info'
  });

  const showModal = (
    message: string, 
    title: string = 'Information', 
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      isConfirm: false
    });
  };

  const showConfirm = (
    message: string,
    title: string = 'Confirmation',
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'warning',
      isConfirm: true,
      onConfirm,
      onCancel
    });
  };

  const hideModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Méthodes de convenance
  const showInfo = (message: string, title: string = 'Information') => 
    showModal(message, title, 'info');
  
  const showSuccess = (message: string, title: string = 'Succès') => 
    showModal(message, title, 'success');
  
  const showWarning = (message: string, title: string = 'Attention') => 
    showModal(message, title, 'warning');
  
  const showError = (message: string, title: string = 'Erreur') => 
    showModal(message, title, 'error');

  const handleConfirm = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    hideModal();
  };

  const handleCancel = () => {
    if (modalState.onCancel) {
      modalState.onCancel();
    }
    hideModal();
  };

  return {
    modalState,
    showModal,
    hideModal,
    showInfo,
    showSuccess,
    showWarning,
    showError,
    showConfirm,
    handleConfirm,
    handleCancel
  };
};
