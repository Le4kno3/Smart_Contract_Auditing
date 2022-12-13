1. CEI - No checks when the partner address is set, an malicious user can set it to point to a malicious contract.

2. CEI - Direct interaction were made to this contract, no checks. Effects were made after interaction.

3. The withdraw function is `public` and no checks to identify which user, so irrespective if the user is owner or a partner, it will always execute the same way.

3. Typically a re-entrancy attack, where we can cause DoS for the owner of the contract
    - state variables are stored independently.
    - reentrency attack will impact only these state variable.

4. The owner will not received any money or DoS on the owner because
    - the partner is transferred first.
    - the partner will cause re-entrancy attack, means the contract will never reach the line where the owner is paid.