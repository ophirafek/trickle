import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { CustomFieldValueComponent } from '../custom-field-value/custom-field-value.component';
import { CustomFieldService } from 'custom-field-lib';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-custom-fields-container',
  templateUrl: './custom-fields-container.component.html',
  standalone: false
})
export class CustomFieldsContainerComponent implements OnInit {
  @Input() entityType: string = '';
  @Input() entityId: number = 0;
  @Input() parentForm!: FormGroup;
  @Input() formGroupName: string = 'customFields';
  
  loading: boolean = false;
  error: string | null = null;
  
  // Group fields by group name
  fieldGroups: { [groupName: string]: any[] } = {};
  
  constructor(
    private customFieldService: CustomFieldService,
    private fb: FormBuilder
  ) {
    customFieldService.apiUrl = `${environment.settingsApiUrl}/api/customfields`; // Set your API URL here
  }
  
  ngOnInit(): void {
    if (!this.entityType) {
      console.error('Entity type is required for CustomFieldsContainerComponent');
      return;
    }
    
    // Create a form group for custom fields if it doesn't exist
    if (!this.parentForm.contains(this.formGroupName)) {
      this.parentForm.addControl(this.formGroupName, this.fb.group({}));
    }
    
    this.loadCustomFields();
  }
  
  /**
   * Load custom field definitions and values for this entity
   */
  loadCustomFields(): void {
    this.loading = true;
    this.error = null;
    
    // Get the form group for custom fields
    const customFieldsGroup = this.parentForm.get(this.formGroupName) as FormGroup;
    
    // For a new entity (entityId=0), load only definitions
    if (this.entityId === 0) {
      this.customFieldService.getDefinitionsByEntityType(this.entityType)
        .subscribe({
          next: (definitions) => {
            this.groupFieldDefinitions(definitions);
            
            // Add form controls for each field
            definitions.forEach(def => {
              const defaultValue = this.customFieldService.getDefaultValueForType(def.fieldType);
              customFieldsGroup.addControl(def.name, this.fb.control(defaultValue));
            });
            
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading custom field definitions:', error);
            this.error = 'Failed to load custom fields. Please try again.';
            this.loading = false;
          }
        });
    } 
    // For existing entity, load definitions with values
    else {
      this.customFieldService.getFieldsWithValuesByEntityGrouped(this.entityType, this.entityId)
        .subscribe({
          next: (fieldGroups) => {
            // Convert the array of groups to our format
            for (const group of fieldGroups) {
              const groupName = group.name || 'General';
              
              if (!this.fieldGroups[groupName]) {
                this.fieldGroups[groupName] = [];
              }
              
              // Add fields with their values
              for (const field of group.fields) {
                this.fieldGroups[groupName].push({
                  definition: field.definition,
                  value: field.value
                });
                
                // Add form control with current value
                let fieldValue = null;
                
                if (field.value) {
                  // Set the appropriate value based on field type
                  switch (field.definition.fieldType) {
                    case 'text':
                    case 'textarea':
                      fieldValue = field.value.textValue;
                      break;
                    case 'number':
                    case 'select':
                    case 'general-code':
                      fieldValue = field.value.numberValue;
                      break;
                    case 'date':
                      fieldValue = field.value.dateValue ? new Date(field.value.dateValue) : null;
                      break;
                    case 'boolean':
                      fieldValue = field.value.booleanValue;
                      break;
                    case 'multi-select':
                      fieldValue = field.value.selectedOptionIds || [];
                      break;
                  }
                } else {
                  // No value exists, use default
                  fieldValue = field.definition.defaultValue;
                }
                
                customFieldsGroup.addControl(field.definition.name, this.fb.control(fieldValue));
              }
            }
            
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading custom fields with values:', error);
            this.error = 'Failed to load custom fields. Please try again.';
            this.loading = false;
          }
        });
    }
  }
  
  /**
   * Group field definitions by group name
   */
  private groupFieldDefinitions(definitions: any[]): void {
    this.fieldGroups = {};
    
    for (const def of definitions) {
      const groupName = def.groupName || 'General';
      
      if (!this.fieldGroups[groupName]) {
        this.fieldGroups[groupName] = [];
      }
      
      this.fieldGroups[groupName].push({
        definition: def,
        value: null
      });
    }
  }
  
  /**
   * Prepare custom field values for saving
   */
  prepareCustomFieldValues(): any[] {
    const customFieldsGroup = this.parentForm.get(this.formGroupName) as FormGroup;
    const values: any[] = [];
    
    // Iterate through all groups and fields
    Object.keys(this.fieldGroups).forEach(groupName => {
      this.fieldGroups[groupName].forEach(field => {
        const definition = field.definition;
        const formValue = customFieldsGroup.get(definition.name)?.value;
        
        if (formValue !== null && formValue !== undefined) {
          const value = this.customFieldService.createEmptyValue(
            this.entityType,
            this.entityId,
            definition.id,
            definition.fieldType
          );
          
          // Set the appropriate value based on field type
          switch (definition.fieldType) {
            case 'text':
            case 'textarea':
              value.textValue = formValue;
              break;
            case 'number':
            case 'select':
            case 'general-code':
              value.numberValue = formValue;
              break;
            case 'date':
              value.dateValue = formValue;
              break;
            case 'boolean':
              value.booleanValue = formValue;
              break;
            case 'multi-select':
              value.selectedOptionIds = formValue;
              break;
          }
          
          // Include the existing ID if there is one
          if (field.value && field.value.id) {
            value.id = field.value.id;
          }
          
          values.push(value);
        }
      });
    });
    
    return values;
  }
  
  /**
   * Get field names by group
   */
  getGroupNames(): string[] {
    return Object.keys(this.fieldGroups);
  }
  
  /**
   * Get fields for a specific group
   */
  getFieldsForGroup(groupName: string): any[] {
    return this.fieldGroups[groupName] || [];
  }
  
  /**
   * Check if a group has any fields
   */
  hasFields(groupName: string): boolean {
    return this.fieldGroups[groupName] && this.fieldGroups[groupName].length > 0;
  }
}