/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/rafflebot.json`.
 */
export type Rafflebot = {
  "address": "HPwwzQZ3NSQ5wcy2jfiBF9GZsGWksw6UbjUxJbaetq7n",
  "metadata": {
    "name": "rafflebot",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "AI agent that creates and runs provably fair raffles on Solana"
  },
  "instructions": [
    {
      "name": "buyTickets",
      "docs": [
        "Buy tickets for a raffle"
      ],
      "discriminator": [
        48,
        16,
        122,
        137,
        24,
        214,
        198,
        58
      ],
      "accounts": [
        {
          "name": "raffle",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  102,
                  102,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raffle.authority",
                "account": "raffle"
              },
              {
                "kind": "account",
                "path": "raffle.name",
                "account": "raffle"
              }
            ]
          }
        },
        {
          "name": "entry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  110,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "raffle"
              },
              {
                "kind": "account",
                "path": "buyer"
              }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "raffle"
              }
            ]
          }
        },
        {
          "name": "buyerTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "numTickets",
          "type": "u32"
        }
      ]
    },
    {
      "name": "cancelRaffle",
      "docs": [
        "Cancel raffle and enable refunds (authority only, or auto after deadline if threshold not met)"
      ],
      "discriminator": [
        135,
        191,
        223,
        141,
        192,
        186,
        234,
        254
      ],
      "accounts": [
        {
          "name": "raffle",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  102,
                  102,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raffle.authority",
                "account": "raffle"
              },
              {
                "kind": "account",
                "path": "raffle.name",
                "account": "raffle"
              }
            ]
          }
        },
        {
          "name": "authority",
          "docs": [
            "Can be authority OR anyone (if deadline passed + threshold not met)"
          ],
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "claimPrize",
      "docs": [
        "Claim prize (winner calls this with their entry)"
      ],
      "discriminator": [
        157,
        233,
        139,
        121,
        246,
        62,
        234,
        235
      ],
      "accounts": [
        {
          "name": "raffle",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  102,
                  102,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raffle.authority",
                "account": "raffle"
              },
              {
                "kind": "account",
                "path": "raffle.name",
                "account": "raffle"
              }
            ]
          }
        },
        {
          "name": "winnerEntry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  110,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "raffle"
              },
              {
                "kind": "account",
                "path": "winner"
              }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "raffle"
              }
            ]
          }
        },
        {
          "name": "winnerTokenAccount",
          "writable": true
        },
        {
          "name": "platformTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "winner",
          "signer": true
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": []
    },
    {
      "name": "claimRefund",
      "docs": [
        "Claim refund (for cancelled raffles)"
      ],
      "discriminator": [
        15,
        16,
        30,
        161,
        255,
        228,
        97,
        60
      ],
      "accounts": [
        {
          "name": "raffle",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  102,
                  102,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raffle.authority",
                "account": "raffle"
              },
              {
                "kind": "account",
                "path": "raffle.name",
                "account": "raffle"
              }
            ]
          }
        },
        {
          "name": "entry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  110,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "raffle"
              },
              {
                "kind": "account",
                "path": "buyer"
              }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "raffle"
              }
            ]
          }
        },
        {
          "name": "buyerTokenAccount",
          "writable": true
        },
        {
          "name": "platformTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "buyer",
          "signer": true
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": []
    },
    {
      "name": "commitDraw",
      "docs": [
        "Phase 1: Commit to Switchboard randomness (authority calls after deadline)",
        "Bundle this instruction with Switchboard's commitIx in the same tx"
      ],
      "discriminator": [
        210,
        106,
        32,
        68,
        253,
        95,
        229,
        1
      ],
      "accounts": [
        {
          "name": "raffle",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  102,
                  102,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raffle.authority",
                "account": "raffle"
              },
              {
                "kind": "account",
                "path": "raffle.name",
                "account": "raffle"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "raffle"
          ]
        },
        {
          "name": "randomnessAccount"
        }
      ],
      "args": []
    },
    {
      "name": "createRaffle",
      "docs": [
        "Create a new raffle (agent-only in practice, but permissionless on-chain)"
      ],
      "discriminator": [
        226,
        206,
        159,
        34,
        213,
        207,
        98,
        126
      ],
      "accounts": [
        {
          "name": "raffle",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  102,
                  102,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "name"
              }
            ]
          }
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "raffle"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "docs": [
            "The SPL token mint (e.g., USDC)"
          ]
        },
        {
          "name": "platformWallet",
          "docs": [
            "Platform wallet to receive fees"
          ]
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "ticketPrice",
          "type": "u64"
        },
        {
          "name": "minPot",
          "type": "u64"
        },
        {
          "name": "maxPerWallet",
          "type": "u32"
        },
        {
          "name": "endTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "settleDraw",
      "docs": [
        "Phase 2: Settle draw using revealed Switchboard randomness",
        "Bundle this instruction with Switchboard's revealIx in the same tx"
      ],
      "discriminator": [
        175,
        154,
        75,
        30,
        118,
        117,
        107,
        194
      ],
      "accounts": [
        {
          "name": "raffle",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  97,
                  102,
                  102,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "raffle.authority",
                "account": "raffle"
              },
              {
                "kind": "account",
                "path": "raffle.name",
                "account": "raffle"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "raffle"
          ]
        },
        {
          "name": "randomnessAccount"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "entry",
      "discriminator": [
        63,
        18,
        152,
        113,
        215,
        246,
        221,
        250
      ]
    },
    {
      "name": "raffle",
      "discriminator": [
        143,
        133,
        63,
        173,
        138,
        10,
        142,
        200
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidEndTime",
      "msg": "End time must be in the future"
    },
    {
      "code": 6001,
      "name": "invalidTicketPrice",
      "msg": "Ticket price must be greater than 0"
    },
    {
      "code": 6002,
      "name": "invalidMinPot",
      "msg": "Minimum pot must be greater than 0"
    },
    {
      "code": 6003,
      "name": "minPotTooLow",
      "msg": "Minimum pot must be >= ticket price"
    },
    {
      "code": 6004,
      "name": "invalidName",
      "msg": "Name must be 1-32 characters"
    },
    {
      "code": 6005,
      "name": "raffleNotActive",
      "msg": "Raffle is not active"
    },
    {
      "code": 6006,
      "name": "raffleClosed",
      "msg": "Raffle has ended"
    },
    {
      "code": 6007,
      "name": "invalidTicketCount",
      "msg": "Invalid ticket count"
    },
    {
      "code": 6008,
      "name": "maxTicketsExceeded",
      "msg": "Maximum tickets per wallet exceeded"
    },
    {
      "code": 6009,
      "name": "overflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6010,
      "name": "raffleNotEnded",
      "msg": "Raffle has not ended yet"
    },
    {
      "code": 6011,
      "name": "noTickets",
      "msg": "No tickets sold"
    },
    {
      "code": 6012,
      "name": "thresholdNotMet",
      "msg": "Minimum pot threshold not met"
    },
    {
      "code": 6013,
      "name": "drawNotComplete",
      "msg": "Draw not complete"
    },
    {
      "code": 6014,
      "name": "noWinnerDrawn",
      "msg": "No winner drawn"
    },
    {
      "code": 6015,
      "name": "notWinner",
      "msg": "Not the winner"
    },
    {
      "code": 6016,
      "name": "cannotCancel",
      "msg": "Cannot cancel raffle"
    },
    {
      "code": 6017,
      "name": "raffleNotCancelled",
      "msg": "Raffle is not cancelled"
    },
    {
      "code": 6018,
      "name": "notEntryOwner",
      "msg": "Not the entry owner"
    },
    {
      "code": 6019,
      "name": "alreadyRefunded",
      "msg": "Already refunded"
    },
    {
      "code": 6020,
      "name": "invalidRandomnessAccount",
      "msg": "Invalid randomness account"
    },
    {
      "code": 6021,
      "name": "randomnessExpired",
      "msg": "Randomness has expired"
    },
    {
      "code": 6022,
      "name": "randomnessAlreadyRevealed",
      "msg": "Randomness already revealed"
    },
    {
      "code": 6023,
      "name": "randomnessNotResolved",
      "msg": "Randomness not yet resolved"
    },
    {
      "code": 6024,
      "name": "drawNotCommitted",
      "msg": "Draw not committed yet"
    }
  ],
  "types": [
    {
      "name": "entry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "raffle",
            "type": "pubkey"
          },
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "startTicketIndex",
            "type": "u32"
          },
          {
            "name": "numTickets",
            "type": "u32"
          },
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "refunded",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "raffle",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "escrow",
            "type": "pubkey"
          },
          {
            "name": "platformWallet",
            "type": "pubkey"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "minPot",
            "type": "u64"
          },
          {
            "name": "maxPerWallet",
            "type": "u32"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "totalTickets",
            "type": "u32"
          },
          {
            "name": "totalPot",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "raffleStatus"
              }
            }
          },
          {
            "name": "winner",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "winningTicket",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "randomness",
            "type": {
              "option": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "randomnessAccount",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "commitSlot",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "escrowBump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "raffleStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "drawCommitted"
          },
          {
            "name": "drawComplete"
          },
          {
            "name": "claimed"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    }
  ]
};
