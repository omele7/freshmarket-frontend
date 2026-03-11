import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService, UserService } from '../../../core/services';
import { User, UpdateUserRequest, SaveAddressRequest, Address } from '../../../shared/models';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  // State signals
  user = signal<User | null>(null);
  loading = signal(false);
  editingProfile = signal(false);
  editingAddress = signal(false);
  saving = signal(false);
  savingAddress = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  addressErrorMessage = signal<string | null>(null);
  addressSuccessMessage = signal<string | null>(null);

  // Forms
  profileForm: FormGroup;
  addressForm: FormGroup;

  constructor() {
    // Initialize profile form
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      phone: ['', [Validators.maxLength(20), Validators.pattern(/^[0-9\s\+\-]*$/)]],
    });

    // Initialize address form
    this.addressForm = this.fb.group({
      street: ['', [Validators.required, Validators.maxLength(200)]],
      city: ['', [Validators.required, Validators.maxLength(100)]],
      state: ['', [Validators.required, Validators.maxLength(100)]],
      zipCode: ['', [Validators.required, Validators.maxLength(20)]],
      country: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  /**
   * Load user profile from server
   */
  loadUserProfile(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.userService.getCurrentUserProfile().subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
        this.populateForms();
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.loading.set(false);
        this.errorMessage.set('Error al cargar el perfil');
      },
    });
  }

  /**
   * Populate forms with user data
   */
  private populateForms(): void {
    const currentUser = this.user();
    if (!currentUser) return;

    // Populate profile form
    this.profileForm.patchValue({
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      phone: currentUser.phone || '',
    });

    // Populate address form if address exists
    if (currentUser.address) {
      this.addressForm.patchValue(currentUser.address);
    }
  }

  /**
   * Toggle profile edit mode
   */
  toggleEditProfile(): void {
    this.editingProfile.set(!this.editingProfile());
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.editingProfile()) {
      this.populateForms();
    }
  }

  /**
   * Cancel profile edit
   */
  cancelEditProfile(): void {
    this.editingProfile.set(false);
    this.populateForms();
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  /**
   * Save profile changes
   */
  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const currentUser = this.user();
    if (!currentUser) return;

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const updateData: UpdateUserRequest = this.profileForm.value;

    this.userService.updateProfile(currentUser.id, updateData).subscribe({
      next: (response) => {
        this.user.set(response.user);
        this.saving.set(false);
        this.successMessage.set('Perfil actualizado correctamente');
        this.editingProfile.set(false);

        // Update auth service user
        this.authService['setUser'](response.user);

        // Clear success message after 3 seconds
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.saving.set(false);
        this.errorMessage.set(error.message || 'Error al actualizar el perfil');
      },
    });
  }

  /**
   * Toggle address edit mode
   */
  toggleEditAddress(): void {
    this.editingAddress.set(!this.editingAddress());
    this.addressErrorMessage.set(null);
    this.addressSuccessMessage.set(null);

    if (this.editingAddress()) {
      this.populateForms();
    }
  }

  /**
   * Cancel address edit
   */
  cancelEditAddress(): void {
    this.editingAddress.set(false);
    this.populateForms();
    this.addressErrorMessage.set(null);
    this.addressSuccessMessage.set(null);
  }

  /**
   * Save address
   */
  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const currentUser = this.user();
    if (!currentUser) return;

    this.savingAddress.set(true);
    this.addressErrorMessage.set(null);
    this.addressSuccessMessage.set(null);

    const addressData: SaveAddressRequest = this.addressForm.value;

    this.userService.saveAddress(currentUser.id, addressData).subscribe({
      next: (response) => {
        // Update user with new address
        const updatedUser = { ...currentUser, address: response.address };
        this.user.set(updatedUser);
        this.savingAddress.set(false);
        this.addressSuccessMessage.set('Dirección guardada correctamente');
        this.editingAddress.set(false);

        // Update auth service user
        this.authService['setUser'](updatedUser);

        // Clear success message after 3 seconds
        setTimeout(() => this.addressSuccessMessage.set(null), 3000);
      },
      error: (error) => {
        console.error('Error saving address:', error);
        this.savingAddress.set(false);
        this.addressErrorMessage.set(error.message || 'Error al guardar la dirección');
      },
    });
  }
}
