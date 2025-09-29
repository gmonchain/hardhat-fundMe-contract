// SPDX-License-Identifier: MIT

// pragma
pragma solidity ^0.8.8;

// imports
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// Error codes
error FundMe__NotOwner();

// Interfaces, Libraries, Contracts
/**
 * @title A contract for crowd finding
 * @author Kunal K.
 * @notice This contract is to demo sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    // type declarations
    using PriceConverter for uint256;

    // State Variables
    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;
    address private i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;
    uint256 public constant MINIMUM_FUND_AMOUNT = 0.01 ether; // Example: 0.01 ETH
    uint256 public constant MAXIMUM_FUND_AMOUNT = 10 ether; // Example: 10 ETH
    AggregatorV3Interface private s_priceFeed;

    // Modifiers
    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    // Constructor
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // Receive
    receive() external payable {
        fund();
    }

    // Fallback
    fallback() external payable {
        fund();
    }

    // Other functions(external, public, internal, private)
    /**
     * @notice This function funds this contract
     * @dev This implements price feeds as our library
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        require(msg.value >= MINIMUM_FUND_AMOUNT, "Fund amount is too low!");
        require(msg.value <= MAXIMUM_FUND_AMOUNT, "Fund amount is too high!");
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    // function withdraw() public onlyOwner {
    //     for (
    //         uint256 funderIndex = 0;
    //         funderIndex < s_funders.length;
    //         funderIndex++
    //     ) {
    //         address funder = s_funders[funderIndex];
    //         s_addressToAmountFunded[funder] = 0;
    //     }
    //     s_funders = new address[](0);
    //     // // transfer
    //     // payable(msg.sender).transfer(address(this).balance);
    //     // // send
    //     // bool sendSuccess = payable(msg.sender).send(address(this).balance);
    //     // require(sendSuccess, "Send failed");
    //     // call
    //     (bool callSuccess, ) = payable(msg.sender).call{
    //         value: address(this).balance
    //     }("");
    //     require(callSuccess, "Call failed");
    // }

    function withdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success, "Call failed");
    }

    // view/pure
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
