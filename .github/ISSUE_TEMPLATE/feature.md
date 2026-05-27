name: Feature request
description: Propose a new feature or enhancement for PayFlow Protocol
labels: ["enhancement"]
body:
  - type: markdown
    attributes:
      value: |
        Suggest a new idea or improvement.
  - type: textarea
    id: feature-description
    attributes:
      label: Describe the feature
      description: What should this feature do?
      placeholder: E.g., Add support for streaming assets with vesting curves.
    validations:
      required: true
  - type: textarea
    id: problem-solved
    attributes:
      label: What problem does this solve?
      description: Explain the use case or user friction this feature addresses.
    validations:
      required: true
