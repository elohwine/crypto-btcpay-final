// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @notice Minimal Ownable
contract Ownable {
    address public owner;
    constructor() { owner = msg.sender; }
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero");
        owner = newOwner;
    }
}

/// @notice Minimal ERC20-like TRC-20 token (6 decimals) with owner mint
contract TestUSDT is Ownable {
    string public name = "Test USDT";
    string public symbol = "tUSDT";
    uint8 public decimals = 6;
    uint256 public totalSupply;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed ownerAddr, address indexed spender, uint256 value);

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function allowance(address ownerAddr, address spender) external view returns (uint256) {
        return _allowances[ownerAddr][spender];
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = _allowances[from][msg.sender];
        require(allowed >= amount, "allowance");
        _allowances[from][msg.sender] = allowed - amount;
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "to zero");
        uint256 fromBal = _balances[from];
        require(fromBal >= amount, "balance");
        _balances[from] = fromBal - amount;
        _balances[to] += amount;
        emit Transfer(from, to, amount);
    }

    /// @notice owner-only mint
    function mint(address to, uint256 amount) external onlyOwner returns (bool) {
        require(to != address(0), "to zero");
        totalSupply += amount;
        _balances[to] += amount;
        emit Transfer(address(0), to, amount);
        return true;
    }
}
