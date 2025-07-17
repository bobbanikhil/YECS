import os
import pandas as pd
from utils.data_processor import DataProcessor


def main():
    # Initialize processor
    processor = DataProcessor()

    # Define dataset paths with corrected paths
    current_dir = os.getcwd()
    print(f"Current directory: {current_dir}")

    # Look for datasets in common locations
    possible_paths = [
        './student_spending.csv',
        './loan_approval_dataset-1.csv',
        '../student_spending.csv',
        '../loan_approval_dataset-1.csv',
        './Datasets/student_spending.csv',
        './Datasets/loan_approval_dataset-1.csv',
        '../Datasets/student_spending.csv',
        '../Datasets/loan_approval_dataset-1.csv'
    ]

    loan_data_path = None
    student_data_path = None

    # Find the correct paths
    for path in possible_paths:
        if 'student_spending' in path and os.path.exists(path):
            student_data_path = path
            print(f"Found student data at: {path}")
        elif 'loan_approval' in path and os.path.exists(path):
            loan_data_path = path
            print(f"Found loan data at: {path}")

    if not loan_data_path:
        print("Error: loan_approval_dataset file not found")
        print("Please ensure the loan dataset file is in one of these locations:")
        for path in possible_paths:
            if 'loan_approval' in path:
                print(f"  - {path}")
        return

    if not student_data_path:
        print("Error: student_spending.csv file not found")
        print("Please ensure the student spending file is in one of these locations:")
        for path in possible_paths:
            if 'student_spending' in path:
                print(f"  - {path}")
        return

    print("Processing datasets...")

    # Create training dataset
    features, scores = processor.create_training_dataset(loan_data_path, student_data_path)

    # Create output directory
    output_dir = './data/processed'
    os.makedirs(output_dir, exist_ok=True)

    # Save processed data
    processor.save_processed_data(features, scores, output_dir)

    print("Dataset processing completed!")


if __name__ == "__main__":
    main()
