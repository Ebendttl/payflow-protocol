name: Bug report
description: Create a report to help us improve PayFlow Protocol
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
  - type: textarea
    id: describe-bug
    attributes:
      label: Describe the bug
      description: A clear and concise description of what the bug is.
      placeholder: E.g., The SDK throws an error when trying to claim a completed stream.
    validations:
      required: true
  - type: textarea
    id: reproduction-steps
    attributes:
      label: Steps to Reproduce
      description: How did you run into the bug?
      placeholder: |
        1. Initialize SDK
        2. Call streams.claim()
        3. See error
    validations:
      required: true
