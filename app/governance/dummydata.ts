import { Proposal } from "@/hooks/gov/interfaces/proposal";

export const convertToProposalType = (data: any): Proposal => {
    return {
      proposal_id: data.proposal_id,
      type_url: data.type_url,
      status: data.status as ProposalStatus, // You may need to cast the status to the correct type.
      submit_time: data.submit_time,
      voting_start_time: data.voting_start_time,
      voting_end_time: data.voting_end_time,
      deposit_end_time: data.deposit_end_time,
      total_deposit: data.total_deposit,
      final_vote: data.final_vote,
    };
  };

  type ProposalStatus =
  | "PROPOSAL_STATUS_UNSPECIFIED"
  | "PROPOSAL_STATUS_DEPOSIT_PERIOD"
  | "PROPOSAL_STATUS_VOTING_PERIOD"
  | "PROPOSAL_STATUS_PASSED"
  | "PROPOSAL_STATUS_REJECTED"
  | "PROPOSAL_STATUS_FAILED";


  

export const proposalsData = [
    {
        "proposal_id": 1,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "2744280454999999999999960",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2022-07-31T16:17:29.164673974Z",
        "deposit_end_time": "2022-08-02T16:17:29.164673974Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "10000000"
            }
        ],
        "voting_start_time": "2022-07-31T16:17:29.164673974Z",
        "voting_end_time": "2022-08-01T16:17:29.164673974Z"
    },
    {
        "proposal_id": 2,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "2744280454999999999999960",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2022-07-31T16:21:02.919916764Z",
        "deposit_end_time": "2022-08-02T16:21:02.919916764Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "10000000"
            }
        ],
        "voting_start_time": "2022-07-31T16:21:02.919916764Z",
        "voting_end_time": "2022-08-01T16:21:02.919916764Z"
    },
    {
        "proposal_id": 3,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "2644279454999999999999960",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2022-07-31T16:24:12.672302997Z",
        "deposit_end_time": "2022-08-02T16:24:12.672302997Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "10000000"
            }
        ],
        "voting_start_time": "2022-07-31T16:24:12.672302997Z",
        "voting_end_time": "2022-08-01T16:24:12.672302997Z"
    },
    {
        "proposal_id": 4,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "2644279454999999999999960",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2022-07-31T16:26:35.656013394Z",
        "deposit_end_time": "2022-08-02T16:26:35.656013394Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "10000000"
            }
        ],
        "voting_start_time": "2022-07-31T16:26:35.656013394Z",
        "voting_end_time": "2022-08-01T16:26:35.656013394Z"
    },
    {
        "proposal_id": 5,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "2644347454999999999999960",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2022-07-31T22:02:05.19887376Z",
        "deposit_end_time": "2022-08-02T22:02:05.19887376Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000"
            }
        ],
        "voting_start_time": "2022-07-31T22:02:05.19887376Z",
        "voting_end_time": "2022-08-01T22:02:05.19887376Z"
    },
    {
        "proposal_id": 6,
        "type_url": "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "11708449239899999999999937",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2022-08-10T14:04:15.850238899Z",
        "deposit_end_time": "2022-08-12T14:04:15.850238899Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "10000000"
            }
        ],
        "voting_start_time": "2022-08-10T14:04:15.850238899Z",
        "voting_end_time": "2022-08-10T15:04:15.850238899Z"
    },
    {
        "proposal_id": 7,
        "type_url": "/canto.govshuttle.v1.LendingMarketProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "21116831141057659927259770",
            "abstain": "103540000000000000000",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2022-08-17T15:36:30.369803355Z",
        "deposit_end_time": "2022-08-19T15:36:30.369803355Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "10000000000000"
            }
        ],
        "voting_start_time": "2022-08-17T15:36:30.369803355Z",
        "voting_end_time": "2022-08-17T16:36:30.369803355Z"
    },
    {
        "proposal_id": 8,
        "type_url": "/canto.govshuttle.v1.LendingMarketProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "18057176525568936652068522",
            "abstain": "470000000000000000000",
            "no": "400000000000000000",
            "no_with_veto": "0"
        },
        "submit_time": "2022-08-17T17:33:54.995690458Z",
        "deposit_end_time": "2022-08-19T17:33:54.995690458Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "10000000000000"
            }
        ],
        "voting_start_time": "2022-08-17T17:33:54.995690458Z",
        "voting_end_time": "2022-08-17T18:33:54.995690458Z"
    },
    {
        "proposal_id": 9,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "10487672572308920204781589",
            "abstain": "2610110000000000000000",
            "no": "12349000000000000000000",
            "no_with_veto": "1000000000000000000000"
        },
        "submit_time": "2022-08-17T19:21:53.540467656Z",
        "deposit_end_time": "2022-08-19T19:21:53.540467656Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000000"
            }
        ],
        "voting_start_time": "2022-08-17T19:21:53.540467656Z",
        "voting_end_time": "2022-08-17T20:21:53.540467656Z"
    },
    {
        "proposal_id": 10,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "10516160672392347407726750",
            "abstain": "1030000000000000000000",
            "no": "78000000000000000000",
            "no_with_veto": "0"
        },
        "submit_time": "2022-08-17T19:22:27.978261056Z",
        "deposit_end_time": "2022-08-19T19:22:27.978261056Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000000"
            }
        ],
        "voting_start_time": "2022-08-17T19:22:27.978261056Z",
        "voting_end_time": "2022-08-17T20:22:27.978261056Z"
    },
    {
        "proposal_id": 11,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "10554526394833401171132965",
            "abstain": "314200000000000000000",
            "no": "3652910000000000000000",
            "no_with_veto": "0"
        },
        "submit_time": "2022-08-17T19:23:36.23135728Z",
        "deposit_end_time": "2022-08-19T19:23:36.23135728Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000000"
            }
        ],
        "voting_start_time": "2022-08-17T19:23:36.23135728Z",
        "voting_end_time": "2022-08-17T20:23:36.23135728Z"
    },
    {
        "proposal_id": 12,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "10554262645892574999373830",
            "abstain": "4981200000000000000000",
            "no": "17313610000000000000000",
            "no_with_veto": "30999000000000000000"
        },
        "submit_time": "2022-08-17T19:24:21.596128691Z",
        "deposit_end_time": "2022-08-19T19:24:21.596128691Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000000"
            }
        ],
        "voting_start_time": "2022-08-17T19:24:21.596128691Z",
        "voting_end_time": "2022-08-17T20:24:21.596128691Z"
    },
    {
        "proposal_id": 13,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "62887006802811329872776192",
            "abstain": "307000000000000000000",
            "no": "82813200136554988248151",
            "no_with_veto": "0"
        },
        "submit_time": "2022-08-19T16:53:22.223495557Z",
        "deposit_end_time": "2022-08-21T16:53:22.223495557Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000000000"
            }
        ],
        "voting_start_time": "2022-08-19T16:53:22.223495557Z",
        "voting_end_time": "2022-08-19T17:53:22.223495557Z"
    },
    {
        "proposal_id": 14,
        "type_url": "/canto.govshuttle.v1.LendingMarketProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "61545681918412327865594686",
            "abstain": "0",
            "no": "15502500136554988248151",
            "no_with_veto": "69820000000000000000000"
        },
        "submit_time": "2022-08-19T19:02:29.065581645Z",
        "deposit_end_time": "2022-08-21T19:02:29.065581645Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000"
            }
        ],
        "voting_start_time": "2022-08-19T19:02:29.065581645Z",
        "voting_end_time": "2022-08-19T20:02:29.065581645Z"
    },
    {
        "proposal_id": 15,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "44950454901737512295957745",
            "abstain": "4313100000000000000000",
            "no": "2510000000000000000000",
            "no_with_veto": "0"
        },
        "submit_time": "2022-09-18T16:10:38.046424288Z",
        "deposit_end_time": "2022-09-20T16:10:38.046424288Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "10000000000000000"
            }
        ],
        "voting_start_time": "2022-09-18T16:10:38.046424288Z",
        "voting_end_time": "2022-09-18T17:10:38.046424288Z"
    },
    {
        "proposal_id": 16,
        "type_url": "/canto.govshuttle.v1.LendingMarketProposal",
        "status": "PROPOSAL_STATUS_REJECTED",
        "final_vote": {
            "yes": "40241809348829296010354315",
            "abstain": "0",
            "no": "2943428774182708034294",
            "no_with_veto": "0"
        },
        "submit_time": "2022-09-18T16:28:08.903184705Z",
        "deposit_end_time": "2022-09-20T16:28:08.903184705Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000000000000"
            }
        ],
        "voting_start_time": "2022-09-18T16:28:08.903184705Z",
        "voting_end_time": "2022-09-18T17:28:08.903184705Z"
    },
    {
        "proposal_id": 17,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_REJECTED",
        "final_vote": {
            "yes": "30595329445881824833369323",
            "abstain": "3596528774182708034294",
            "no": "3010000000000000000000",
            "no_with_veto": "0"
        },
        "submit_time": "2022-09-18T16:37:30.731821615Z",
        "deposit_end_time": "2022-09-20T16:37:30.731821615Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000000000000"
            }
        ],
        "voting_start_time": "2022-09-18T16:37:30.731821615Z",
        "voting_end_time": "2022-09-18T17:37:30.731821615Z"
    },
    {
        "proposal_id": 18,
        "type_url": "/canto.govshuttle.v1.LendingMarketProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "82010422066524023884241888",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2022-09-18T21:19:37.956178531Z",
        "deposit_end_time": "2022-09-20T21:19:37.956178531Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000000000"
            }
        ],
        "voting_start_time": "2022-09-18T21:19:37.956178531Z",
        "voting_end_time": "2022-09-18T22:19:37.956178531Z"
    },
    {
        "proposal_id": 19,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "97719220968622783189128973",
            "abstain": "1121000000000000000000",
            "no": "1090000000000000000000",
            "no_with_veto": "188422500378218900436"
        },
        "submit_time": "2022-09-18T23:13:33.718390722Z",
        "deposit_end_time": "2022-09-20T23:13:33.718390722Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000000000000"
            }
        ],
        "voting_start_time": "2022-09-18T23:13:33.718390722Z",
        "voting_end_time": "2022-09-19T00:13:33.718390722Z"
    },
    {
        "proposal_id": 20,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "80369536349562683353178576",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2022-10-02T23:38:30.3036629Z",
        "deposit_end_time": "2022-10-04T23:38:30.3036629Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000000000000000"
            }
        ],
        "voting_start_time": "2022-10-02T23:38:30.3036629Z",
        "voting_end_time": "2022-10-03T00:38:30.3036629Z"
    },
    {
        "proposal_id": 21,
        "type_url": "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "121474914385934851113146683",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2022-10-17T15:00:01.642991446Z",
        "deposit_end_time": "2022-10-19T15:00:01.642991446Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "4000000000000000000"
            }
        ],
        "voting_start_time": "2022-10-17T15:00:01.642991446Z",
        "voting_end_time": "2022-10-17T16:00:01.642991446Z"
    },
    {
        "proposal_id": 22,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "115176118188780074211056023",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2022-10-18T15:08:42.850175031Z",
        "deposit_end_time": "2022-10-20T15:08:42.850175031Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "10000000000000000"
            }
        ],
        "voting_start_time": "2022-10-18T15:08:42.850175031Z",
        "voting_end_time": "2022-10-18T16:08:42.850175031Z"
    },
    {
        "proposal_id": 23,
        "type_url": "/canto.govshuttle.v1.LendingMarketProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "115985277881292152214219568",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2022-10-18T15:29:41.361806298Z",
        "deposit_end_time": "2022-10-20T15:29:41.361806298Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000"
            }
        ],
        "voting_start_time": "2022-10-18T15:29:41.361806298Z",
        "voting_end_time": "2022-10-18T16:29:41.361806298Z"
    },
    {
        "proposal_id": 24,
        "type_url": "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "103268982547547772599978095",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2022-10-20T16:37:02.020267555Z",
        "deposit_end_time": "2022-10-22T16:37:02.020267555Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "10000000000000000000"
            }
        ],
        "voting_start_time": "2022-10-20T16:37:02.020267555Z",
        "voting_end_time": "2022-10-20T17:37:02.020267555Z"
    },
    {
        "proposal_id": 25,
        "type_url": "/canto.govshuttle.v1.LendingMarketProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "93657903529114772895992889",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2022-10-21T00:02:04.097362162Z",
        "deposit_end_time": "2022-10-23T00:02:04.097362162Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000"
            }
        ],
        "voting_start_time": "2022-10-21T00:02:04.097362162Z",
        "voting_end_time": "2022-10-21T01:02:04.097362162Z"
    },
    {
        "proposal_id": 26,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "80939602029389841748755717",
            "abstain": "0",
            "no": "6690000000000000000000",
            "no_with_veto": "0"
        },
        "submit_time": "2022-10-31T17:22:16.974517378Z",
        "deposit_end_time": "2022-11-02T17:22:16.974517378Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000"
            }
        ],
        "voting_start_time": "2022-10-31T17:22:16.974517378Z",
        "voting_end_time": "2022-10-31T18:22:16.974517378Z"
    },
    {
        "proposal_id": 27,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "94550017542238862421715272",
            "abstain": "617779532361415952781",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2022-11-13T15:26:04.249547572Z",
        "deposit_end_time": "2022-11-15T15:26:04.249547572Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000000000000"
            }
        ],
        "voting_start_time": "2022-11-13T15:26:04.249547572Z",
        "voting_end_time": "2022-11-13T16:26:04.249547572Z"
    },
    {
        "proposal_id": 28,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "99514096475390419166584916",
            "abstain": "0",
            "no": "368265348000000000000001",
            "no_with_veto": "0"
        },
        "submit_time": "2022-11-18T16:00:28.362546408Z",
        "deposit_end_time": "2022-11-20T16:00:28.362546408Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "10000000000000000"
            }
        ],
        "voting_start_time": "2022-11-18T16:00:28.362546408Z",
        "voting_end_time": "2022-11-18T17:00:28.362546408Z"
    },
    {
        "proposal_id": 29,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "100009132325502062710536883",
            "abstain": "7343840134900594220",
            "no": "12542528126233867058",
            "no_with_veto": "16850506546903696773"
        },
        "submit_time": "2022-12-02T16:34:46.546056827Z",
        "deposit_end_time": "2022-12-04T16:34:46.546056827Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000"
            }
        ],
        "voting_start_time": "2022-12-02T16:34:46.546056827Z",
        "voting_end_time": "2022-12-02T17:34:46.546056827Z"
    },
    {
        "proposal_id": 30,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "110710073938845602574600578",
            "abstain": "200000000000000000000",
            "no": "770000000000000000000",
            "no_with_veto": "0"
        },
        "submit_time": "2022-12-06T16:00:14.735028447Z",
        "deposit_end_time": "2022-12-08T16:00:14.735028447Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000"
            }
        ],
        "voting_start_time": "2022-12-06T16:00:14.735028447Z",
        "voting_end_time": "2022-12-06T17:00:14.735028447Z"
    },
    {
        "proposal_id": 31,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "74308353967259914612411123",
            "abstain": "3016850506546903696773",
            "no": "9967799999999999999999",
            "no_with_veto": "7050000000000000000"
        },
        "submit_time": "2022-12-13T16:02:00.189419415Z",
        "deposit_end_time": "2022-12-15T16:02:00.189419415Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000000000000"
            }
        ],
        "voting_start_time": "2022-12-13T16:02:00.189419415Z",
        "voting_end_time": "2022-12-13T17:02:00.189419415Z"
    },
    {
        "proposal_id": 32,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "85345050648132608201259828",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2022-12-19T16:00:40.560897511Z",
        "deposit_end_time": "2022-12-21T16:00:40.560897511Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "10000000000000000"
            }
        ],
        "voting_start_time": "2022-12-19T16:00:40.560897511Z",
        "voting_end_time": "2022-12-19T17:00:40.560897511Z"
    },
    {
        "proposal_id": 33,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_REJECTED",
        "final_vote": {
            "yes": "60774831417145669799407932",
            "abstain": "1091750004491985680493",
            "no": "50000000000000000000",
            "no_with_veto": "0"
        },
        "submit_time": "2022-12-30T16:01:26.309068829Z",
        "deposit_end_time": "2023-01-01T16:01:26.309068829Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000"
            }
        ],
        "voting_start_time": "2022-12-30T16:01:26.309068829Z",
        "voting_end_time": "2022-12-30T17:01:26.309068829Z"
    },
    {
        "proposal_id": 34,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "84928921796551817962576668",
            "abstain": "0",
            "no": "4100000000000000000000",
            "no_with_veto": "2992500000048371070"
        },
        "submit_time": "2023-01-04T16:38:21.659886444Z",
        "deposit_end_time": "2023-01-06T16:38:21.659886444Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000"
            }
        ],
        "voting_start_time": "2023-01-04T16:38:21.659886444Z",
        "voting_end_time": "2023-01-04T17:38:21.659886444Z"
    },
    {
        "proposal_id": 35,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "86512135793729775700398007",
            "abstain": "25346000000000000000000",
            "no": "533745658505087023775",
            "no_with_veto": "0"
        },
        "submit_time": "2023-01-12T16:02:31.392443642Z",
        "deposit_end_time": "2023-01-14T16:02:31.392443642Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000000000000"
            }
        ],
        "voting_start_time": "2023-01-12T16:02:31.392443642Z",
        "voting_end_time": "2023-01-12T17:02:31.392443642Z"
    },
    {
        "proposal_id": 36,
        "type_url": "/cosmos.gov.v1beta1.TextProposal",
        "status": "PROPOSAL_STATUS_REJECTED",
        "final_vote": {
            "yes": "478586787093285224232111",
            "abstain": "0",
            "no": "4065762779352057732069543",
            "no_with_veto": "6520968321912965859520589"
        },
        "submit_time": "2023-01-12T18:43:51.168154726Z",
        "deposit_end_time": "2023-01-14T18:43:51.168154726Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1410003536393882304"
            }
        ],
        "voting_start_time": "2023-01-12T18:43:51.168154726Z",
        "voting_end_time": "2023-01-12T19:43:51.168154726Z"
    },
    {
        "proposal_id": 37,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "84416795390297412548573712",
            "abstain": "2992500000048371070",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-01-17T16:00:57.147533523Z",
        "deposit_end_time": "2023-01-19T16:00:57.147533523Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000"
            }
        ],
        "voting_start_time": "2023-01-17T16:00:57.147533523Z",
        "voting_end_time": "2023-01-17T17:00:57.147533523Z"
    },
    {
        "proposal_id": 38,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "120772780962499101390990629",
            "abstain": "168000000000000000000",
            "no": "2217387504985612778479",
            "no_with_veto": "10000000000000000000"
        },
        "submit_time": "2023-01-19T16:01:04.355809862Z",
        "deposit_end_time": "2023-01-21T16:01:04.355809862Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000000000000"
            }
        ],
        "voting_start_time": "2023-01-19T16:01:04.355809862Z",
        "voting_end_time": "2023-01-19T17:01:04.355809862Z"
    },
    {
        "proposal_id": 39,
        "type_url": "/canto.govshuttle.v1.LendingMarketProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "105695500165534233850122077",
            "abstain": "2468000000000000000000",
            "no": "1691750004491985680493",
            "no_with_veto": "466084999999999999999"
        },
        "submit_time": "2023-01-19T16:02:48.474153357Z",
        "deposit_end_time": "2023-01-21T16:02:48.474153357Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000"
            }
        ],
        "voting_start_time": "2023-01-19T16:02:48.474153357Z",
        "voting_end_time": "2023-01-19T17:02:48.474153357Z"
    },
    {
        "proposal_id": 40,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "122082280415704540941512799",
            "abstain": "0",
            "no": "9850562952249502353",
            "no_with_veto": "2992500000048371070"
        },
        "submit_time": "2023-01-24T16:00:08.391879883Z",
        "deposit_end_time": "2023-01-26T16:00:08.391879883Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000"
            }
        ],
        "voting_start_time": "2023-01-24T16:00:08.391879883Z",
        "voting_end_time": "2023-01-24T17:00:08.391879883Z"
    },
    {
        "proposal_id": 41,
        "type_url": "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "137117235182090429234829207",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "74249946432163698897629"
        },
        "submit_time": "2023-01-25T16:00:04.222973153Z",
        "deposit_end_time": "2023-01-27T16:00:04.222973153Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000"
            }
        ],
        "voting_start_time": "2023-01-25T16:00:48.234095709Z",
        "voting_end_time": "2023-01-25T17:00:48.234095709Z"
    },
    {
        "proposal_id": 42,
        "type_url": "/cosmos.gov.v1beta1.TextProposal",
        "status": "PROPOSAL_STATUS_REJECTED",
        "final_vote": {
            "yes": "11516030106007967056988054",
            "abstain": "1392500000889650202119",
            "no": "11849459026138528169955527",
            "no_with_veto": "69235790437812350009753295"
        },
        "submit_time": "2023-01-25T18:03:22.571828902Z",
        "deposit_end_time": "2023-01-27T18:03:22.571828902Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1410003536393882304"
            }
        ],
        "voting_start_time": "2023-01-25T18:03:22.571828902Z",
        "voting_end_time": "2023-01-25T19:03:22.571828902Z"
    },
    {
        "proposal_id": 43,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "146420122570059704462525320",
            "abstain": "30000000000000000000",
            "no": "1105000000033859749506",
            "no_with_veto": "0"
        },
        "submit_time": "2023-01-26T16:16:03.334370734Z",
        "deposit_end_time": "2023-01-28T16:16:03.334370734Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000000"
            }
        ],
        "voting_start_time": "2023-01-26T16:16:03.334370734Z",
        "voting_end_time": "2023-01-26T17:16:03.334370734Z"
    },
    {
        "proposal_id": 44,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "121190925037371274066572428",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-01-26T18:15:21.672003093Z",
        "deposit_end_time": "2023-01-28T18:15:21.672003093Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000"
            }
        ],
        "voting_start_time": "2023-01-26T18:15:21.672003093Z",
        "voting_end_time": "2023-01-26T19:15:21.672003093Z"
    },
    {
        "proposal_id": 45,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "136687247772346773626925278",
            "abstain": "256397333065528448657",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-02-02T16:01:15.388520951Z",
        "deposit_end_time": "2023-02-04T16:01:15.388520951Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "100000000000000000"
            }
        ],
        "voting_start_time": "2023-02-02T16:01:15.388520951Z",
        "voting_end_time": "2023-02-02T17:01:15.388520951Z"
    },
    {
        "proposal_id": 46,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "130367853092372788601021219",
            "abstain": "0",
            "no": "1125950760118015834712",
            "no_with_veto": "0"
        },
        "submit_time": "2023-02-02T16:02:05.093646381Z",
        "deposit_end_time": "2023-02-04T16:02:05.093646381Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000"
            }
        ],
        "voting_start_time": "2023-02-02T16:02:05.093646381Z",
        "voting_end_time": "2023-02-02T17:02:05.093646381Z"
    },
    {
        "proposal_id": 47,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "96284425826282755479565703",
            "abstain": "0",
            "no": "1100000000000000000",
            "no_with_veto": "0"
        },
        "submit_time": "2023-02-07T16:02:40.497238354Z",
        "deposit_end_time": "2023-02-09T16:02:40.497238354Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000100000000000000000"
            }
        ],
        "voting_start_time": "2023-02-07T16:03:36.402163858Z",
        "voting_end_time": "2023-02-07T17:03:36.402163858Z"
    },
    {
        "proposal_id": 48,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "118051812280314434891251932",
            "abstain": "149000000000000000000",
            "no": "4507431479092278016957",
            "no_with_veto": "0"
        },
        "submit_time": "2023-02-13T16:08:21.900729076Z",
        "deposit_end_time": "2023-02-15T16:08:21.900729076Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-02-13T16:08:21.900729076Z",
        "voting_end_time": "2023-02-13T17:08:21.900729076Z"
    },
    {
        "proposal_id": 49,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "81040006322099122708791837",
            "abstain": "490000000000000000000",
            "no": "796250000052358456",
            "no_with_veto": "0"
        },
        "submit_time": "2023-02-17T16:01:32.123473214Z",
        "deposit_end_time": "2023-02-19T16:01:32.123473214Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-02-17T16:01:32.123473214Z",
        "voting_end_time": "2023-02-17T17:01:32.123473214Z"
    },
    {
        "proposal_id": 50,
        "type_url": "/canto.govshuttle.v1.LendingMarketProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "92134239107861710843712254",
            "abstain": "22902710000145113212172",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-02-17T16:06:10.386487682Z",
        "deposit_end_time": "2023-02-19T16:06:10.386487682Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-02-17T16:06:10.386487682Z",
        "voting_end_time": "2023-02-17T17:06:10.386487682Z"
    },
    {
        "proposal_id": 51,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "123026529831359600642875795",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-02-21T15:02:03.610639837Z",
        "deposit_end_time": "2023-02-23T15:02:03.610639837Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-02-21T15:02:03.610639837Z",
        "voting_end_time": "2023-02-21T16:02:03.610639837Z"
    },
    {
        "proposal_id": 52,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "123018022398880508364858838",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-02-21T15:03:08.916768652Z",
        "deposit_end_time": "2023-02-23T15:03:08.916768652Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-02-21T15:03:08.916768652Z",
        "voting_end_time": "2023-02-21T16:03:08.916768652Z"
    },
    {
        "proposal_id": 53,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "123014602398880484179323475",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-02-21T15:03:20.880161013Z",
        "deposit_end_time": "2023-02-23T15:03:20.880161013Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-02-21T15:03:20.880161013Z",
        "voting_end_time": "2023-02-21T16:03:20.880161013Z"
    },
    {
        "proposal_id": 54,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "123014562398880484179323475",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-02-21T15:03:33.007546224Z",
        "deposit_end_time": "2023-02-23T15:03:33.007546224Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-02-21T15:03:33.007546224Z",
        "voting_end_time": "2023-02-21T16:03:33.007546224Z"
    },
    {
        "proposal_id": 55,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "123013762398880484179323475",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-02-21T15:03:45.005431238Z",
        "deposit_end_time": "2023-02-23T15:03:45.005431238Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-02-21T15:03:45.005431238Z",
        "voting_end_time": "2023-02-21T16:03:45.005431238Z"
    },
    {
        "proposal_id": 56,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "123015042482495126905601793",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-02-21T15:03:56.815847157Z",
        "deposit_end_time": "2023-02-23T15:03:56.815847157Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-02-21T15:03:56.815847157Z",
        "voting_end_time": "2023-02-21T16:03:56.815847157Z"
    },
    {
        "proposal_id": 57,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "123011995969876092830709860",
            "abstain": "0",
            "no": "600000000000000000000",
            "no_with_veto": "0"
        },
        "submit_time": "2023-02-21T15:04:08.553870928Z",
        "deposit_end_time": "2023-02-23T15:04:08.553870928Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-02-21T15:04:08.553870928Z",
        "voting_end_time": "2023-02-21T16:04:08.553870928Z"
    },
    {
        "proposal_id": 58,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "113465352393902664581602738",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-02-21T15:04:20.833102881Z",
        "deposit_end_time": "2023-02-23T15:04:20.833102881Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-02-21T15:04:20.833102881Z",
        "voting_end_time": "2023-02-21T16:04:20.833102881Z"
    },
    {
        "proposal_id": 59,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "147842446062708970701136752",
            "abstain": "1492500889020914532076",
            "no": "1000000000000000000000",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-16T15:00:36.065060705Z",
        "deposit_end_time": "2023-03-18T15:00:36.065060705Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-16T15:00:36.065060705Z",
        "voting_end_time": "2023-03-16T16:00:36.065060705Z"
    },
    {
        "proposal_id": 60,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "89407631359700665683103966",
            "abstain": "40249086981972485073380234",
            "no": "0",
            "no_with_veto": "19850000002094338243"
        },
        "submit_time": "2023-03-16T15:01:36.43267724Z",
        "deposit_end_time": "2023-03-18T15:01:36.43267724Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-16T15:01:36.43267724Z",
        "voting_end_time": "2023-03-16T16:01:36.43267724Z"
    },
    {
        "proposal_id": 61,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "135891385044377997713343321",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-30T15:05:07.85509788Z",
        "deposit_end_time": "2023-04-01T15:05:07.85509788Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-30T15:05:07.85509788Z",
        "voting_end_time": "2023-03-30T16:05:07.85509788Z"
    },
    {
        "proposal_id": 62,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "159078638781614722760713112",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-31T15:07:04.071822423Z",
        "deposit_end_time": "2023-04-02T15:07:04.071822423Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-31T15:07:04.071822423Z",
        "voting_end_time": "2023-03-31T16:07:04.071822423Z"
    },
    {
        "proposal_id": 63,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "159266045813712348248168819",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-31T15:08:10.715842177Z",
        "deposit_end_time": "2023-04-02T15:08:10.715842177Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-31T15:08:10.715842177Z",
        "voting_end_time": "2023-03-31T16:08:10.715842177Z"
    },
    {
        "proposal_id": 64,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "159263980865254866766523806",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-31T15:08:34.637856482Z",
        "deposit_end_time": "2023-04-02T15:08:34.637856482Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-31T15:08:34.637856482Z",
        "voting_end_time": "2023-03-31T16:08:34.637856482Z"
    },
    {
        "proposal_id": 65,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "159068528781614722760713112",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-31T15:09:23.213318402Z",
        "deposit_end_time": "2023-04-02T15:09:23.213318402Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-31T15:09:23.213318402Z",
        "voting_end_time": "2023-03-31T16:09:23.213318402Z"
    },
    {
        "proposal_id": 66,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "159068083781614722760713112",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-31T15:09:41.226337636Z",
        "deposit_end_time": "2023-04-02T15:09:41.226337636Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-31T15:09:41.226337636Z",
        "voting_end_time": "2023-03-31T16:09:41.226337636Z"
    },
    {
        "proposal_id": 67,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "143278688789733457256246273",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-31T15:09:53.237439677Z",
        "deposit_end_time": "2023-04-02T15:09:53.237439677Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-31T15:09:53.237439677Z",
        "voting_end_time": "2023-03-31T16:09:53.237439677Z"
    },
    {
        "proposal_id": 68,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "159067121733157241279068099",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-31T15:11:17.892830707Z",
        "deposit_end_time": "2023-04-02T15:11:17.892830707Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-31T15:11:17.892830707Z",
        "voting_end_time": "2023-03-31T16:11:17.892830707Z"
    },
    {
        "proposal_id": 69,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "159066998781614722760713112",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-31T15:11:36.088618333Z",
        "deposit_end_time": "2023-04-02T15:11:36.088618333Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-31T15:11:36.088618333Z",
        "voting_end_time": "2023-03-31T16:11:36.088618333Z"
    },
    {
        "proposal_id": 70,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "159066998781614722760713112",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-31T15:12:06.174949779Z",
        "deposit_end_time": "2023-04-02T15:12:06.174949779Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-31T15:12:06.174949779Z",
        "voting_end_time": "2023-03-31T16:12:06.174949779Z"
    },
    {
        "proposal_id": 71,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "159066998781614722760713112",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-31T15:12:24.006763144Z",
        "deposit_end_time": "2023-04-02T15:12:24.006763144Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-31T15:12:24.006763144Z",
        "voting_end_time": "2023-03-31T16:12:24.006763144Z"
    },
    {
        "proposal_id": 72,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "159065998781614722760713112",
            "abstain": "0",
            "no": "1000000000000000000000",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-31T15:12:48.414528594Z",
        "deposit_end_time": "2023-04-02T15:12:48.414528594Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-31T15:12:48.414528594Z",
        "voting_end_time": "2023-03-31T16:12:48.414528594Z"
    },
    {
        "proposal_id": 73,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "159065398781614722760713112",
            "abstain": "600000000000000000000",
            "no": "1000000000000000000000",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-31T15:13:12.208993301Z",
        "deposit_end_time": "2023-04-02T15:13:12.208993301Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-31T15:13:12.208993301Z",
        "voting_end_time": "2023-03-31T16:13:12.208993301Z"
    },
    {
        "proposal_id": 74,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "159263522913712348248168819",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-31T15:13:36.150364278Z",
        "deposit_end_time": "2023-04-02T15:13:36.150364278Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-31T15:13:36.150364278Z",
        "voting_end_time": "2023-03-31T16:13:36.150364278Z"
    },
    {
        "proposal_id": 75,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "159066398781614722760713112",
            "abstain": "0",
            "no": "600000000000000000000",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-31T15:14:00.594673642Z",
        "deposit_end_time": "2023-04-02T15:14:00.594673642Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-31T15:14:00.594673642Z",
        "voting_end_time": "2023-03-31T16:14:00.594673642Z"
    },
    {
        "proposal_id": 76,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "137794824275245202508157037",
            "abstain": "0",
            "no": "21469893638467145740011782",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-31T15:14:24.202170112Z",
        "deposit_end_time": "2023-04-02T15:14:24.202170112Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-31T15:14:24.202170112Z",
        "voting_end_time": "2023-03-31T16:14:24.202170112Z"
    },
    {
        "proposal_id": 77,
        "type_url": "/canto.erc20.v1.RegisterCoinProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "85580675506863080961402391",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-03-31T16:05:56.004217309Z",
        "deposit_end_time": "2023-04-02T16:05:56.004217309Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-03-31T16:05:56.004217309Z",
        "voting_end_time": "2023-03-31T17:05:56.004217309Z"
    },
    {
        "proposal_id": 78,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "92197067436333777503783205",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-04-17T15:15:17.667733957Z",
        "deposit_end_time": "2023-04-19T15:15:17.667733957Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-04-17T15:15:17.667733957Z",
        "voting_end_time": "2023-04-17T16:15:17.667733957Z"
    },
    {
        "proposal_id": 79,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "110438826020827085393272537",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-04-24T15:09:04.374870793Z",
        "deposit_end_time": "2023-04-26T15:09:04.374870793Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-04-24T15:09:04.374870793Z",
        "voting_end_time": "2023-04-24T16:09:04.374870793Z"
    },
    {
        "proposal_id": 80,
        "type_url": "/canto.govshuttle.v1.LendingMarketProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "132694519725494314420753895",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-05-11T15:03:01.179035957Z",
        "deposit_end_time": "2023-05-13T15:03:01.179035957Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-05-11T15:03:01.179035957Z",
        "voting_end_time": "2023-05-11T16:03:01.179035957Z"
    },
    {
        "proposal_id": 81,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "132127119794008820560614021",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-05-11T15:04:27.018168595Z",
        "deposit_end_time": "2023-05-13T15:04:27.018168595Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-05-11T15:04:27.018168595Z",
        "voting_end_time": "2023-05-11T16:04:27.018168595Z"
    },
    {
        "proposal_id": 82,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "129394711688336566485908960",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-05-11T15:04:57.640109271Z",
        "deposit_end_time": "2023-05-13T15:04:57.640109271Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-05-11T15:04:57.640109271Z",
        "voting_end_time": "2023-05-11T16:04:57.640109271Z"
    },
    {
        "proposal_id": 83,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "91761159805942815531576561",
            "abstain": "11986929005280998815735",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-05-31T14:59:47.291773684Z",
        "deposit_end_time": "2023-06-02T14:59:47.291773684Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-05-31T14:59:47.291773684Z",
        "voting_end_time": "2023-05-31T15:59:47.291773684Z"
    },
    {
        "proposal_id": 84,
        "type_url": "/canto.govshuttle.v1.LendingMarketProposal",
        "status": "PROPOSAL_STATUS_REJECTED",
        "final_vote": {
            "yes": "67065348387795268896817044",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-06-12T15:02:07.890164656Z",
        "deposit_end_time": "2023-06-14T15:02:07.890164656Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-06-12T15:02:07.890164656Z",
        "voting_end_time": "2023-06-12T16:02:07.890164656Z"
    },
    {
        "proposal_id": 85,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_REJECTED",
        "final_vote": {
            "yes": "67059041740295034442237243",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-06-12T15:03:32.884762494Z",
        "deposit_end_time": "2023-06-14T15:03:32.884762494Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-06-12T15:03:32.884762494Z",
        "voting_end_time": "2023-06-12T16:03:32.884762494Z"
    },
    {
        "proposal_id": 86,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_REJECTED",
        "final_vote": {
            "yes": "63412657850042453333140315",
            "abstain": "0",
            "no": "3645878002752580383530867",
            "no_with_veto": "0"
        },
        "submit_time": "2023-06-12T15:04:27.691427975Z",
        "deposit_end_time": "2023-06-14T15:04:27.691427975Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-06-12T15:04:27.691427975Z",
        "voting_end_time": "2023-06-12T16:04:27.691427975Z"
    },
    {
        "proposal_id": 87,
        "type_url": "/canto.govshuttle.v1.LendingMarketProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "158209342879370543082164051",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-06-12T20:10:48.264012386Z",
        "deposit_end_time": "2023-06-14T20:10:48.264012386Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-06-12T20:10:48.264012386Z",
        "voting_end_time": "2023-06-12T21:10:48.264012386Z"
    },
    {
        "proposal_id": 88,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "158209342879370543082164051",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-06-12T20:12:19.392335826Z",
        "deposit_end_time": "2023-06-14T20:12:19.392335826Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-06-12T20:12:19.392335826Z",
        "voting_end_time": "2023-06-12T21:12:19.392335826Z"
    },
    {
        "proposal_id": 89,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "154973998986520700330090178",
            "abstain": "0",
            "no": "3645878002752580383530867",
            "no_with_veto": "0"
        },
        "submit_time": "2023-06-12T20:13:14.132981286Z",
        "deposit_end_time": "2023-06-14T20:13:14.132981286Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-06-12T20:13:14.132981286Z",
        "voting_end_time": "2023-06-12T21:13:14.132981286Z"
    },
    {
        "proposal_id": 90,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "118475928744740736813127621",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-06-16T17:22:56.783807979Z",
        "deposit_end_time": "2023-06-18T17:22:56.783807979Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-06-16T17:22:56.783807979Z",
        "voting_end_time": "2023-06-16T18:22:56.783807979Z"
    },
    {
        "proposal_id": 91,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "144513856940987361335018159",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-07-12T16:06:10.658282408Z",
        "deposit_end_time": "2023-07-14T16:06:10.658282408Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-07-12T16:06:10.658282408Z",
        "voting_end_time": "2023-07-12T17:06:10.658282408Z"
    },
    {
        "proposal_id": 92,
        "type_url": "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "164309753028312757341340534",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-07-18T16:00:04.362225529Z",
        "deposit_end_time": "2023-07-20T16:00:04.362225529Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-07-18T16:00:04.362225529Z",
        "voting_end_time": "2023-07-18T17:00:04.362225529Z"
    },
    {
        "proposal_id": 93,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_REJECTED",
        "final_vote": {
            "yes": "22517215622270426696437593",
            "abstain": "0",
            "no": "10000000000000000000000",
            "no_with_veto": "0"
        },
        "submit_time": "2023-07-19T00:21:49.468264198Z",
        "deposit_end_time": "2023-07-21T00:21:49.468264198Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-07-19T00:21:49.468264198Z",
        "voting_end_time": "2023-07-19T01:21:49.468264198Z"
    },
    {
        "proposal_id": 94,
        "type_url": "/canto.govshuttle.v1.LendingMarketProposal",
        "status": "PROPOSAL_STATUS_REJECTED",
        "final_vote": {
            "yes": "51016841987164277722278328",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-08-11T14:05:41.76566339Z",
        "deposit_end_time": "2023-08-13T14:05:41.76566339Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-08-11T14:05:41.76566339Z",
        "voting_end_time": "2023-08-11T15:05:41.76566339Z"
    },
    {
        "proposal_id": 95,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_REJECTED",
        "final_vote": {
            "yes": "51016841987164277722278328",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-08-11T14:06:42.508068138Z",
        "deposit_end_time": "2023-08-13T14:06:42.508068138Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-08-11T14:06:42.508068138Z",
        "voting_end_time": "2023-08-11T15:06:42.508068138Z"
    },
    {
        "proposal_id": 96,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_REJECTED",
        "final_vote": {
            "yes": "72566336210315028484037595",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-08-11T14:07:49.283905487Z",
        "deposit_end_time": "2023-08-13T14:07:49.283905487Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-08-11T14:07:49.283905487Z",
        "voting_end_time": "2023-08-11T15:07:49.283905487Z"
    },
    {
        "proposal_id": 97,
        "type_url": "/canto.govshuttle.v1.LendingMarketProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "109595231195824880549913648",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-08-11T15:14:59.354243134Z",
        "deposit_end_time": "2023-08-13T15:14:59.354243134Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-08-11T15:14:59.354243134Z",
        "voting_end_time": "2023-08-11T16:14:59.354243134Z"
    },
    {
        "proposal_id": 98,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "109595231195824880549913648",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-08-11T15:17:19.522801743Z",
        "deposit_end_time": "2023-08-13T15:17:19.522801743Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-08-11T15:17:19.522801743Z",
        "voting_end_time": "2023-08-11T16:17:19.522801743Z"
    },
    {
        "proposal_id": 99,
        "type_url": "/cosmos.params.v1beta1.ParameterChangeProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "109595231195824880549913648",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-08-11T15:18:13.960390257Z",
        "deposit_end_time": "2023-08-13T15:18:13.960390257Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-08-11T15:18:13.960390257Z",
        "voting_end_time": "2023-08-11T16:18:13.960390257Z"
    },
    {
        "proposal_id": 100,
        "type_url": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
        "status": "PROPOSAL_STATUS_PASSED",
        "final_vote": {
            "yes": "133363613108222863525027026",
            "abstain": "0",
            "no": "0",
            "no_with_veto": "0"
        },
        "submit_time": "2023-08-24T16:07:43.125344052Z",
        "deposit_end_time": "2023-08-26T16:07:43.125344052Z",
        "total_deposit": [
            {
                "denom": "acanto",
                "amount": "1000000000000000000000"
            }
        ],
        "voting_start_time": "2023-08-24T16:07:43.125344052Z",
        "voting_end_time": "2023-08-24T17:07:43.125344052Z"
    }
];

